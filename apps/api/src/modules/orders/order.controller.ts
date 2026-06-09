import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '@/config/database';
import { redis } from '@/config/redis';
import { AppError } from '@/shared/middleware/errorHandler';
import { generateOrderNumber } from '@/shared/utils/generateOrderNumber';
import { sendOrderConfirmation } from '@/shared/services/email.service';

const addressSchema = z.object({
  state: z.string(),
  city: z.string(),
  street: z.string(),
  zip: z.string(),
  country: z.string(),
});

const createOrderSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  address: addressSchema,
  paymentMethod: z.enum(['CARD', 'BANK_TRANSFER']),
  couponCode: z.string().optional(),
});

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, phone, address, paymentMethod, couponCode } = createOrderSchema.parse(req.body);
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
      throw new AppError(400, 'NO_CART', 'No cart found');
    }

    // Get cart from Redis
    const cartKey = `cart:${sessionId}`;
    const cartData = await redis.get(cartKey);
    
    if (!cartData) {
      throw new AppError(400, 'EMPTY_CART', 'Cart is empty');
    }

    const cart = JSON.parse(cartData);

    if (!cart.items || cart.items.length === 0) {
      throw new AppError(400, 'EMPTY_CART', 'Cart is empty');
    }

    // Validate all items have stock
    for (const item of cart.items) {
      const variant = await prisma.variant.findUnique({
        where: { id: item.variantId },
      });

      if (!variant || variant.stockQuantity < item.quantity) {
        throw new AppError(
          400,
          'INSUFFICIENT_STOCK',
          `Insufficient stock for variant ${item.variantId}`
        );
      }
    }

    // Calculate totals
    let subtotal = cart.items.reduce((sum: number, item: any) => 
      sum + (item.unitPrice * item.quantity), 0
    );

    // Get shipping cost (case-insensitive comparison)
    const shippingStates = await prisma.stateShipping.findMany({
      where: {
        active: true,
      },
    });
    const shippingConfig = shippingStates.find(
      s => s.stateName.toLowerCase() === address.state.toLowerCase()
    );

    let shippingCost = 0;
    let needsShippingReview = false;

    if (shippingConfig) {
      shippingCost = Number(shippingConfig.price);
    } else {
      needsShippingReview = true;
    }

    // Apply coupon if provided
    let discountAmount = 0;
    let couponId = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase(), active: true },
      });

      if (coupon) {
        const now = new Date();
        const isValid = 
          (!coupon.startsAt || now >= coupon.startsAt) &&
          (!coupon.endsAt || now <= coupon.endsAt) &&
          (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
          subtotal >= Number(coupon.minOrderAmount);

        if (isValid) {
          couponId = coupon.id;
          if (coupon.type === 'FIXED') {
            discountAmount = Math.min(Number(coupon.value), subtotal);
          } else {
            discountAmount = (subtotal * Number(coupon.value)) / 100;
          }
        }
      }
    }

    const totalAmount = subtotal + shippingCost - discountAmount;

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          channel: 'WEBSITE',
          customerEmail: email,
          customerPhone: phone,
          shippingAddress: JSON.stringify(address),
          stateName: address.state,
          status: paymentMethod === 'CARD' ? 'PENDING_PAYMENT' : 'PENDING_PAYMENT',
          paymentMethod,
          paymentStatus: 'PENDING',
          subtotal,
          shippingCost,
          discountAmount,
          totalAmount,
          needsShippingReview,
          couponId,
          items: {
            create: cart.items.map((item: any) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity,
            })),
          },
        },
      });

      // Decrement stock
      for (const item of cart.items) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });

        // Create inventory adjustment record
        await tx.inventoryAdjustment.create({
          data: {
            variantId: item.variantId,
            quantityChange: -item.quantity,
            reason: 'ORDER',
            orderId: newOrder.id,
          },
        });
      }

      // Update coupon usage if applied
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });

        await tx.couponUsage.create({
          data: {
            couponId,
            orderId: newOrder.id,
          },
        });
      }

      return newOrder;
    });

    // Clear cart
    await redis.del(cartKey);

    // Send order confirmation email
    try {
      await sendOrderConfirmation({
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone || undefined,
        shippingAddress: order.shippingAddress,
        items: cart.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
          size: item.size,
          color: item.color,
        })),
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        discountAmount: order.discountAmount,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        status: order.status,
      });
    } catch (emailError) {
      // Log email error but don't fail the order
      console.error('Failed to send order confirmation email:', emailError);
    }

    res.status(201).json({ data: order });
  } catch (error) {
    next(error);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { take: 1 },
                  },
                },
              },
            },
          },
        },
        coupon: true,
      },
    });

    if (!order) {
      throw new AppError(404, 'NOT_FOUND', 'Order not found');
    }

    res.json({ data: order });
  } catch (error) {
    next(error);
  }
}
