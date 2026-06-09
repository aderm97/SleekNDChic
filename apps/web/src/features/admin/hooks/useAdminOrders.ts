import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import type { OrderStatus } from '@/shared/types';

export interface OrdersFilter {
  status?: OrderStatus;
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  trackingNumber?: string;
  notes?: string;
}

const ORDERS_KEY = 'admin-orders';

export function useAdminOrders() {
  const queryClient = useQueryClient();

  // Get all orders with filters
  const useOrders = (page = 1, limit = 20, filters?: OrdersFilter) => {
    return useQuery({
      queryKey: [ORDERS_KEY, page, limit, filters],
      queryFn: async () => {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));
        if (filters?.status) params.append('status', filters.status);
        if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.search) params.append('search', filters.search);
        
        const response = await api.get(`/admin/orders?${params}`);
        return response.data.data;
      },
    });
  };

  // Get single order
  const useOrder = (orderNumber: string) => {
    return useQuery({
      queryKey: [ORDERS_KEY, orderNumber],
      queryFn: async () => {
        const response = await api.get(`/admin/orders/${orderNumber}`);
        return response.data.data;
      },
      enabled: !!orderNumber,
    });
  };

  // Update order status
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderNumber, status, trackingNumber }: { orderNumber: string; status: OrderStatus; trackingNumber?: string }) => {
      const data: UpdateOrderData = { status };
      if (trackingNumber) data.trackingNumber = trackingNumber;
      
      const response = await api.patch(`/admin/orders/${orderNumber}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY, variables.orderNumber] });
    },
  });

  // Add tracking number
  const addTrackingNumber = useMutation({
    mutationFn: async ({ orderNumber, trackingNumber }: { orderNumber: string; trackingNumber: string }) => {
      const response = await api.patch(`/admin/orders/${orderNumber}`, { trackingNumber });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY, variables.orderNumber] });
    },
  });

  // Export orders to CSV
  const exportOrders = useMutation({
    mutationFn: async (filters?: OrdersFilter) => {
      const params = new URLSearchParams();
      params.append('format', 'csv');
      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      
      const response = await api.get(`/admin/orders/export?${params}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    },
  });

  // Get order statistics
  const useOrderStats = () => {
    return useQuery({
      queryKey: [ORDERS_KEY, 'stats'],
      queryFn: async () => {
        const response = await api.get('/admin/orders/stats');
        return response.data.data;
      },
    });
  };

  return {
    useOrders,
    useOrder,
    updateOrderStatus,
    addTrackingNumber,
    exportOrders,
    useOrderStats,
  };
}
