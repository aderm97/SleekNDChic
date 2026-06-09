import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { Order, ApiResponse } from '@/shared/types';

const QUERY_KEYS = {
  order: (orderNumber: string) => ['order', orderNumber] as const,
};

export function useOrder(orderNumber: string) {
  return useQuery({
    queryKey: QUERY_KEYS.order(orderNumber),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Order>>(`/orders/${orderNumber}`);
      return response.data;
    },
    enabled: !!orderNumber,
  });
}
