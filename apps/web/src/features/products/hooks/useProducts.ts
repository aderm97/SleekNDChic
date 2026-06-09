import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { Product, Category, ApiResponse, ProductFilters } from '@/shared/types';

const QUERY_KEYS = {
  products: ['products'] as const,
  product: (id: string) => ['product', id] as const,
  categories: ['categories'] as const,
};

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.products, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));

      const queryString = params.toString();
      const url = `/products${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get<ApiResponse<Product[]>>(url);
      return response.data;
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.product(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Category[]>>('/categories');
      return response.data;
    },
  });
}
