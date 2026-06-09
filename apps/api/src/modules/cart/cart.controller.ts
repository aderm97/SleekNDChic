import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { redis } from '@/config/redis';
import { prisma } from '@/config/database';
import { AppError } from '@/shared/middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

const CART_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

const addToCartSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

const updateCartSchema = z.object({
  quantity: z.number().int().min(0),
});

function getSessionId(req: Request, res: Response): string {
  let sessionId = req.cookies.sessionId;
  if (!sessionId) {
    sessionId = uuidv4();
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
  return sessionId;
}

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionId(req, res);
    const cartKey = `cart:${sessionId}`;

    const cartData = await redis.get(cartKey);
    const cart = cartData ? JSON.parse(cartData) : { items: [] };

    // Enrich cart items with product details
    const enrichedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        const variant = await prisma.variant.findUnique({
          where: { id: item.variantId },
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: { displayOrder: 'asc' },
                },
              },
            },
          },
        });

        if (!variant) return null;

        return {
          ...item,
          product: variant.product,
          variant,
          totalPrice: item.unitPrice * item.quantity,
        };
      })
    );

    const validItems = enrichedItems.filter(Boolean);
    const subtotal = validItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0);

    res.json({
      data: {
        items: validItems,
        subtotal,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req: Request, res: Response, next: NextFunction) {
  try {
    const { variantId, quantity } = addToCartSchema.parse(req.body);
    const sessionId = getSessionId(req, res);
    const cartKey = `cart:${sessionId}`;

    // Validate variant exists and has stock
    const variant = await prisma.variant.findUnique({
      where: { id: variantId, active: true },
      include: { product: true },
    });

    if (!variant) {
      throw new AppError(404, 'NOT_FOUND', 'Variant not found');
    }

    if (variant.stockQuantity < quantity) {
      throw new AppError(400, 'INSUFFICIENT_STOCK', 'Not enough stock available');
    }

    // Get current cart
    const cartData = await redis.get(cartKey);
    const cart = cartData ? JSON.parse(cartData) : { items: [] };

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.variantId === variantId
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (variant.stockQuantity < newQuantity) {
        throw new AppError(400, 'INSUFFICIENT_STOCK', 'Not enough stock available');
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        variantId,
        productId: variant.productId,
        quantity,
        unitPrice: Number(variant.product.basePrice),
      });
    }

    // Save cart
    await redis.setex(cartKey, CART_TTL, JSON.stringify(cart));

    res.json({ data: cart });
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { variantId } = req.params;
    const { quantity } = updateCartSchema.parse(req.body);
    const sessionId = getSessionId(req, res);
    const cartKey = `cart:${sessionId}`;

    // Get current cart
    const cartData = await redis.get(cartKey);
    if (!cartData) {
      throw new AppError(404, 'NOT_FOUND', 'Cart not found');
    }

    const cart = JSON.parse(cartData);

    if (quantity === 0) {
      // Remove item
      cart.items = cart.items.filter((item: any) => item.variantId !== variantId);
    } else {
      // Validate stock
      const variant = await prisma.variant.findUnique({
        where: { id: variantId },
      });

      if (!variant) {
        throw new AppError(404, 'NOT_FOUND', 'Variant not found');
      }

      if (variant.stockQuantity < quantity) {
        throw new AppError(400, 'INSUFFICIENT_STOCK', 'Not enough stock available');
      }

      // Update quantity
      const itemIndex = cart.items.findIndex((item: any) => item.variantId === variantId);
      if (itemIndex === -1) {
        throw new AppError(404, 'NOT_FOUND', 'Item not in cart');
      }

      cart.items[itemIndex].quantity = quantity;
    }

    // Save cart
    await redis.setex(cartKey, CART_TTL, JSON.stringify(cart));

    res.json({ data: cart });
  } catch (error) {
    next(error);
  }
}

export async function removeFromCart(req: Request, res: Response, next: NextFunction) {
  try {
    const { variantId } = req.params;
    const sessionId = getSessionId(req, res);
    const cartKey = `cart:${sessionId}`;

    // Get current cart
    const cartData = await redis.get(cartKey);
    if (!cartData) {
      throw new AppError(404, 'NOT_FOUND', 'Cart not found');
    }

    const cart = JSON.parse(cartData);

    // Remove item
    cart.items = cart.items.filter((item: any) => item.variantId !== variantId);

    // Save cart
    await redis.setex(cartKey, CART_TTL, JSON.stringify(cart));

    res.json({ data: cart });
  } catch (error) {
    next(error);
  }
}
