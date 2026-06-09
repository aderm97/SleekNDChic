import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategorySales {
  category: string;
  sales: number;
  quantity: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  image?: string;
  totalSales: number;
  totalQuantity: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface PaymentDistribution {
  method: string;
  revenue: number;
  count: number;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  uniqueCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
  todayOrders: number;
}

const ANALYTICS_KEY = 'admin-analytics';

export function useAdminAnalytics() {
  // Get dashboard stats
  const useDashboardStats = () => {
    return useQuery({
      queryKey: [ANALYTICS_KEY, 'dashboard'],
      queryFn: async () => {
        const response = await api.get('/admin/analytics/dashboard');
        return response.data.data as DashboardStats;
      },
    });
  };

  // Get revenue trends
  const useRevenueTrends = (dateRange?: DateRange) => {
    return useQuery({
      queryKey: [ANALYTICS_KEY, 'revenue', dateRange],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
        
        const response = await api.get(`/admin/analytics/revenue-trends?${params}`);
        return response.data.data as RevenueTrend[];
      },
    });
  };

  // Get sales by category
  const useSalesByCategory = (dateRange?: DateRange) => {
    return useQuery({
      queryKey: [ANALYTICS_KEY, 'categories', dateRange],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
        
        const response = await api.get(`/admin/analytics/sales-by-category?${params}`);
        return response.data.data as CategorySales[];
      },
    });
  };

  // Get top products
  const useTopProducts = (limit = 10, dateRange?: DateRange) => {
    return useQuery({
      queryKey: [ANALYTICS_KEY, 'top-products', limit, dateRange],
      queryFn: async () => {
        const params = new URLSearchParams();
        params.append('limit', String(limit));
        if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
        
        const response = await api.get(`/admin/analytics/top-products?${params}`);
        return response.data.data as TopProduct[];
      },
    });
  };

  // Get order status distribution
  const useOrderStatusDistribution = (dateRange?: DateRange) => {
    return useQuery({
      queryKey: [ANALYTICS_KEY, 'status', dateRange],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
        
        const response = await api.get(`/admin/analytics/order-status?${params}`);
        return response.data.data as StatusDistribution[];
      },
    });
  };

  // Get payment method distribution
  const usePaymentMethodDistribution = (dateRange?: DateRange) => {
    return useQuery({
      queryKey: [ANALYTICS_KEY, 'payment-methods', dateRange],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
        
        const response = await api.get(`/admin/analytics/payment-methods?${params}`);
        return response.data.data as PaymentDistribution[];
      },
    });
  };

  return {
    useDashboardStats,
    useRevenueTrends,
    useSalesByCategory,
    useTopProducts,
    useOrderStatusDistribution,
    usePaymentMethodDistribution,
  };
}
