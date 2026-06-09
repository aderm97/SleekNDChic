import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { OrderStatus, PaymentStatus, ShippingMethod } from '@prisma/client';
import { prisma } from '@/config/database';
import { AppError } from '@/shared/middleware/errorHandler';

const orderQuerySchema = z.object({
  page: z.string().default('1'),
  limit: z.string().default('20'),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  trackingNumber: z.string().optional(),
  needsShippingReview: z.boolean().optional(),
});

const updateShippingSchema = z.object({
  price: z.number().optional(),
  active: z.boolean().optional(),
});

const bulkShippingSchema = z.object({
  rates: z.array(
    z.object({
      stateName: z.string(),
      shippingMethod: z.nativeEnum(ShippingMethod),
      price: z.number(),
    })
  ),
});

// Product schemas
const productQuerySchema = z.object({
  page: z.string().default('1'),
  limit: z.string().default('20'),
  search: z.string().optional(),
  category: z.string().optional(),
  active: z.string().optional(),
});

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  basePrice: z.number().positive(),
  sku: z.string().min(1),
  categoryId: z.string().optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
  images: z.array(
    z.object({
      url: z.string().min(1),
      altText: z.string().optional(),
      displayOrder: z.number().int().optional(),
    })
  ).optional(),
  variants: z.array(
    z.object({
      size: z.string().optional(),
      color: z.string().optional(),
      skuSuffix: z.string().optional(),
      stockQuantity: z.number().int().min(0).optional(),
      active: z.boolean().optional(),
    })
  ).optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  basePrice: z.number().positive().optional(),
  sku: z.string().min(1).optional(),
  categoryId: z.string().optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
}).strict();

const toggleProductSchema = z.object({
  active: z.boolean(),
});

const updateVariantSchema = z.object({
  stockQuantity: z.number().int().min(0),
});

export async function getAdminProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, search, category, active } = productQuerySchema.parse(req.query);

    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (active !== undefined) {
      where.active = active === 'true';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            orderBy: { displayOrder: 'asc' },
          },
          variants: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      data: products,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        variants: true,
      },
    });

    if (!product) {
      throw new AppError(404, 'NOT_FOUND', 'Product not found');
    }

    res.json({ data: product });
  } catch (error) {
    next(error);
  }
}

export async function createAdminProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const body = createProductSchema.parse(req.body);

    const data: any = {
      name: body.name,
      description: body.description,
      basePrice: body.basePrice,
      sku: body.sku,
      categoryId: body.categoryId,
      lowStockThreshold: body.lowStockThreshold ?? 5,
      active: body.active ?? true,
    };

    if (body.images && body.images.length > 0) {
      data.images = {
        create: body.images.map((img, index) => ({
          url: img.url,
          altText: img.altText,
          displayOrder: img.displayOrder ?? index,
        })),
      };
    }

    if (body.variants && body.variants.length > 0) {
      data.variants = {
        create: body.variants.map((variant) => ({
          size: variant.size,
          color: variant.color,
          skuSuffix: variant.skuSuffix,
          stockQuantity: variant.stockQuantity ?? 0,
          active: variant.active ?? true,
        })),
      };
    }

    const product = await prisma.product.create({
      data,
      include: {
        category: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        variants: true,
      },
    });

    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const body = updateProductSchema.parse(req.body);

    const data: any = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.basePrice !== undefined) data.basePrice = body.basePrice;
    if (body.sku !== undefined) data.sku = body.sku;
    if (body.categoryId !== undefined) data.categoryId = body.categoryId;
    if (body.lowStockThreshold !== undefined) data.lowStockThreshold = body.lowStockThreshold;
    if (body.active !== undefined) data.active = body.active;

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        variants: true,
      },
    });

    res.json({ data: product });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({ data: { deleted: true } });
  } catch (error) {
    next(error);
  }
}

export async function toggleAdminProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { active } = toggleProductSchema.parse(req.body);

    const product = await prisma.product.update({
      where: { id },
      data: { active },
      include: {
        category: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        variants: true,
      },
    });

    res.json({ data: product });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminVariant(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { stockQuantity } = updateVariantSchema.parse(req.body);

    const variant = await prisma.variant.update({
      where: { id },
      data: { stockQuantity },
    });

    res.json({ data: variant });
  } catch (error) {
    next(error);
  }
}

export async function getAdminOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, status, paymentStatus, startDate, endDate } = orderQuerySchema.parse(req.query);

    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          coupon: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      data: orders,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminOrder(req: Request, res: Response, next: NextFunction) {
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
                    images: true,
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

export async function updateAdminOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderNumber } = req.params;
    const body = updateOrderSchema.parse(req.body);

    const data: any = {};

    if (body.status !== undefined) {
      data.status = body.status;
    }
    if (body.paymentStatus !== undefined) {
      data.paymentStatus = body.paymentStatus;
    }
    if (body.trackingNumber !== undefined) {
      data.trackingNumber = body.trackingNumber;
    }
    if (body.needsShippingReview !== undefined) {
      data.needsShippingReview = body.needsShippingReview;
    }

    const updatedOrder = await prisma.order.update({
      where: { orderNumber },
      data,
      include: {
        items: true,
        coupon: true,
      },
    });

    res.json({ data: updatedOrder });
  } catch (error) {
    next(error);
  }
}

export async function getAdminOrderStats(req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      todayOrders,
      revenueAgg,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING_PAYMENT' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
    ]);

    res.json({
      data: {
        total,
        pending,
        processing,
        shipped,
        delivered,
        cancelled,
        todayOrders,
        totalRevenue: revenueAgg._sum.totalAmount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminShipping(req: Request, res: Response, next: NextFunction) {
  try {
    const states = await prisma.stateShipping.findMany({
      orderBy: { stateName: 'asc' },
    });

    res.json({ data: states });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminShipping(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const body = updateShippingSchema.parse(req.body);

    const data: any = {};

    if (body.price !== undefined) {
      data.price = body.price;
    }
    if (body.active !== undefined) {
      data.active = body.active;
    }

    const state = await prisma.stateShipping.update({
      where: { id },
      data,
    });

    res.json({ data: state });
  } catch (error) {
    next(error);
  }
}

export async function bulkUpdateAdminShipping(req: Request, res: Response, next: NextFunction) {
  try {
    const { rates } = bulkShippingSchema.parse(req.body);

    const operations = rates.map((rate) =>
      prisma.stateShipping.upsert({
        where: {
          stateName_shippingMethod: {
            stateName: rate.stateName,
            shippingMethod: rate.shippingMethod,
          },
        },
        update: {
          price: rate.price,
        },
        create: {
          stateName: rate.stateName,
          shippingMethod: rate.shippingMethod,
          price: rate.price,
          active: true,
        },
      })
    );

    await prisma.$transaction(operations);

    res.json({ data: { updated: rates.length } });
  } catch (error) {
    next(error);
  }
}
