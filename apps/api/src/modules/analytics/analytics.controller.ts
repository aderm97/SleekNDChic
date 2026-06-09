import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/config/database';
import { z } from 'zod';

const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

interface TrendData {
  date: string;
  revenue: number;
  orders: number;
}

// Get revenue trends over time
export async function getRevenueTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate } = dateRangeSchema.parse(req.query);
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Group by day
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        paymentStatus: 'PAID',
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    
    // Group by date
    const trends: TrendData[] = [];
    for (const order of orders) {
      const date = order.createdAt.toISOString().split('T')[0];
      const existing = trends.find(item => item.date === date);
      
      if (existing) {
        existing.revenue += order.totalAmount;
        existing.orders += 1;
      } else {
        trends.push({
          date,
          revenue: order.totalAmount,
          orders: 1,
        });
      }
    }
    
    // Fill in missing dates
    const filledTrends: TrendData[] = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existing = trends.find((t: TrendData) => t.date === dateStr);
      filledTrends.push({
        date: dateStr,
        revenue: existing ? existing.revenue : 0,
        orders: existing ? existing.orders : 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    res.json({ data: filledTrends });
  } catch (error) {
    next(error);
  }
}

interface CategorySales {
  category: string;
  sales: number;
  quantity: number;
}

// Get sales by category
export async function getSalesByCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate } = dateRangeSchema.parse(req.query);
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: start, lte: end },
          paymentStatus: 'PAID',
        },
      },
      include: {
        variant: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
    
    const categorySales: CategorySales[] = [];
    for (const item of orderItems) {
      const categoryName = item.variant.product.category?.name || 'Uncategorized';
      const existing = categorySales.find((c: CategorySales) => c.category === categoryName);
      
      if (existing) {
        existing.sales += item.totalPrice;
        existing.quantity += item.quantity;
      } else {
        categorySales.push({
          category: categoryName,
          sales: item.totalPrice,
          quantity: item.quantity,
        });
      }
    }
    
    res.json({ data: categorySales.sort((a: CategorySales, b: CategorySales) => b.sales - a.sales) });
  } catch (error) {
    next(error);
  }
}

interface ProductSales {
  productId: string;
  name: string;
  image: string | undefined;
  totalSales: number;
  totalQuantity: number;
}

// Get top selling products
export async function getTopProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate, limit = '10' } = dateRangeSchema.extend({
      limit: z.string().optional(),
    }).parse(req.query);
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    const take = parseInt(limit, 10);
    
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: start, lte: end },
          paymentStatus: 'PAID',
        },
      },
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
    });
    
    const productSales = new Map<string, ProductSales>();
    for (const item of orderItems) {
      const productId = item.variant.product.id;
      const existing = productSales.get(productId);
      
      if (existing) {
        existing.totalSales += item.totalPrice;
        existing.totalQuantity += item.quantity;
      } else {
        productSales.set(productId, {
          productId,
          name: item.variant.product.name,
          image: item.variant.product.images[0]?.url,
          totalSales: item.totalPrice,
          totalQuantity: item.quantity,
        });
      }
    }
    
    const sorted = Array.from(productSales.values())
      .sort((a: ProductSales, b: ProductSales) => b.totalSales - a.totalSales)
      .slice(0, take);
    
    res.json({ data: sorted });
  } catch (error) {
    next(error);
  }
}

interface StatusDistribution {
  status: string;
  count: number;
}

// Get order status distribution
export async function getOrderStatusDistribution(req: Request, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate } = dateRangeSchema.parse(req.query);
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: start, lte: end },
      },
      _count: { status: true },
    });
    
    const distribution: StatusDistribution[] = statusCounts.map((item: { status: string; _count: { status: number } }) => ({
      status: item.status,
      count: item._count.status,
    }));
    
    res.json({ data: distribution });
  } catch (error) {
    next(error);
  }
}

interface PaymentDistribution {
  method: string;
  revenue: number;
  count: number;
}

// Get payment method distribution
export async function getPaymentMethodDistribution(req: Request, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate } = dateRangeSchema.parse(req.query);
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const methodCounts = await prisma.order.groupBy({
      by: ['paymentMethod'],
      where: {
        createdAt: { gte: start, lte: end },
        paymentStatus: 'PAID',
      },
      _sum: { totalAmount: true },
      _count: { paymentMethod: true },
    });
    
    const distribution: PaymentDistribution[] = methodCounts.map((item: { paymentMethod: string; _sum: { totalAmount: number | null }; _count: { paymentMethod: number } }) => ({
      method: item.paymentMethod,
      revenue: item._sum.totalAmount || 0,
      count: item._count.paymentMethod,
    }));
    
    res.json({ data: distribution });
  } catch (error) {
    next(error);
  }
}

// Get comprehensive dashboard stats
export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Current period stats
    const [
      currentOrders,
      currentRevenue,
      previousRevenue,
      totalCustomers,
      pendingOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          paymentStatus: 'PAID',
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
            lt: thirtyDaysAgo,
          },
          paymentStatus: 'PAID',
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.groupBy({
        by: ['customerEmail'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { customerEmail: true },
      }),
      prisma.order.count({
        where: {
          status: { in: ['PENDING_PAYMENT', 'PROCESSING'] },
        },
      }),
      prisma.product.count({
        where: {
          variants: {
            some: {
              stockQuantity: { lte: 5 },
            },
          },
        },
      }),
    ]);
    
    const revenue = currentRevenue._sum.totalAmount || 0;
    const prevRevenue = previousRevenue._sum.totalAmount || 0;
    const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    
    // Get today's orders
    const todayOrders = await prisma.order.count({
      where: {
        createdAt: { gte: yesterday },
      },
    });
    
    res.json({
      data: {
        totalRevenue: revenue,
        revenueChange: parseFloat(revenueChange.toFixed(2)),
        totalOrders: currentOrders,
        uniqueCustomers: totalCustomers.length,
        pendingOrders,
        lowStockProducts,
        todayOrders,
      },
    });
  } catch (error) {
    next(error);
  }
}
