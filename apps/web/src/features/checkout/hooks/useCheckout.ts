import { useMutation } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { CreateOrderInput, Order, ApiResponse } from '@/shared/types';

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      const response = await api.post<ApiResponse<Order>>('/orders', data);
      return response.data;
    },
  });
}
