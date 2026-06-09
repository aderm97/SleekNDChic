import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { StateShipping, ApiResponse } from '@/shared/types';

const QUERY_KEYS = {
  shippingStates: ['shipping', 'states'] as const,
};

export function useShippingStates() {
  return useQuery({
    queryKey: QUERY_KEYS.shippingStates,
    queryFn: async () => {
      const response = await api.get<ApiResponse<StateShipping[]>>('/shipping/states');
      return response.data;
    },
  });
}
