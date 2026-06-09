import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '@/config/database';
import { AppError } from '@/shared/middleware/errorHandler';

const validateSchema = z.object({
  code: z.string(),
  subtotal: z.number().min(0),
});

export async function validateCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, subtotal } = validateSchema.parse(req.body);

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.active) {
      throw new AppError(400, 'INVALID_COUPON', 'Invalid coupon code');
    }

    // Check date range
    if (coupon.startsAt && new Date() < coupon.startsAt) {
      throw new AppError(400, 'COUPON_NOT_STARTED', 'Coupon not yet valid');
    }

    if (coupon.endsAt && new Date() > coupon.endsAt) {
      throw new AppError(400, 'COUPON_EXPIRED', 'Coupon has expired');
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError(400, 'COUPON_LIMIT_REACHED', 'Coupon usage limit reached');
    }

    // Check minimum order amount
    if (subtotal < Number(coupon.minOrderAmount)) {
      throw new AppError(
        400,
        'MINIMUM_ORDER_NOT_MET',
        `Minimum order amount of $${coupon.minOrderAmount} required`
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'FIXED') {
      discountAmount = Math.min(Number(coupon.value), subtotal);
    } else {
      discountAmount = (subtotal * Number(coupon.value)) / 100;
    }

    res.json({
      data: {
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          value: Number(coupon.value),
        },
        discountAmount,
      },
    });
  } catch (error) {
    next(error);
  }
}
