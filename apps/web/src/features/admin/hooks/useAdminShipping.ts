import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';

export interface ShippingRate {
  id: string;
  stateName: string;
  shippingMethod: 'AUTHORIZED_CAR_PARK' | 'DELIVERY_COMPANY';
  price: number;
  active: boolean;
}

export interface UpdateShippingRateData {
  price: number;
  active?: boolean;
}

const SHIPPING_KEY = 'admin-shipping';

export function useAdminShipping() {
  const queryClient = useQueryClient();

  // Get all shipping rates
  const useShippingRates = () => {
    return useQuery({
      queryKey: [SHIPPING_KEY],
      queryFn: async () => {
        const response = await api.get('/admin/shipping');
        return response.data.data;
      },
    });
  };

  // Update shipping rate
  const updateShippingRate = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateShippingRateData }) => {
      const response = await api.patch(`/admin/shipping/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIPPING_KEY] });
    },
  });

  // Toggle shipping rate active status
  const toggleShippingRate = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await api.patch(`/admin/shipping/${id}`, { active });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIPPING_KEY] });
    },
  });

  // Bulk update shipping rates
  const bulkUpdateRates = useMutation({
    mutationFn: async (rates: { id: string; price: number }[]) => {
      const response = await api.patch('/admin/shipping/bulk', { rates });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIPPING_KEY] });
    },
  });

  return {
    useShippingRates,
    updateShippingRate,
    toggleShippingRate,
    bulkUpdateRates,
  };
}
