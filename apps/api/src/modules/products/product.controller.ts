import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '@/config/database';
import { AppError } from '@/shared/middleware/errorHandler';

const querySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.string().default('1'),
  limit: z.string().default('24'),
});

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, search, page, limit } = querySchema.parse(req.query);
    
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      active: true,
    };

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            orderBy: { displayOrder: 'asc' },
          },
          variants: {
            where: { active: true },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    // Add stock status to variants
    const productsWithStockStatus = products.map(product => ({
      ...product,
      variants: product.variants.map(variant => ({
        ...variant,
        stockStatus: getStockStatus(variant.stockQuantity, product.lowStockThreshold),
      })),
    }));

    res.json({
      data: productsWithStockStatus,
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

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id, active: true },
      include: {
        category: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        variants: {
          where: { active: true },
        },
      },
    });

    if (!product) {
      throw new AppError(404, 'NOT_FOUND', 'Product not found');
    }

    // Add stock status to variants
    const productWithStockStatus = {
      ...product,
      variants: product.variants.map(variant => ({
        ...variant,
        stockStatus: getStockStatus(variant.stockQuantity, product.lowStockThreshold),
      })),
    };

    res.json({ data: productWithStockStatus });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
}

function getStockStatus(quantity: number, threshold: number): string {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= threshold) return 'low_stock';
  return 'in_stock';
}
