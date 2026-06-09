import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';

export interface CreateProductData {
  name: string;
  description: string;
  basePrice: number;
  sku: string;
  categoryId?: string;
  lowStockThreshold?: number;
  active?: boolean;
  images?: { url: string; altText?: string }[];
  variants?: {
    size?: string;
    color?: string;
    skuSuffix?: string;
    stockQuantity: number;
    active?: boolean;
  }[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

const PRODUCTS_KEY = 'admin-products';

export function useAdminProducts() {
  const queryClient = useQueryClient();

  // Get all products with pagination
  const useProducts = (page = 1, limit = 20, search?: string) => {
    return useQuery({
      queryKey: [PRODUCTS_KEY, page, limit, search],
      queryFn: async () => {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));
        if (search) params.append('search', search);
        
        const response = await api.get(`/admin/products?${params}`);
        return response.data.data;
      },
    });
  };

  // Get single product
  const useProduct = (id: string) => {
    return useQuery({
      queryKey: [PRODUCTS_KEY, id],
      queryFn: async () => {
        const response = await api.get(`/admin/products/${id}`);
        return response.data.data;
      },
      enabled: !!id,
    });
  };

  // Create product
  const createProduct = useMutation({
    mutationFn: async (data: CreateProductData) => {
      const response = await api.post('/admin/products', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });

  // Update product
  const updateProduct = useMutation({
    mutationFn: async ({ id, ...data }: UpdateProductData) => {
      const response = await api.patch(`/admin/products/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, variables.id] });
    },
  });

  // Delete product
  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });

  // Toggle product active status
  const toggleProductStatus = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await api.patch(`/admin/products/${id}`, { active });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, variables.id] });
    },
  });

  // Update variant stock
  const updateVariantStock = useMutation({
    mutationFn: async ({ variantId, stockQuantity }: { variantId: string; stockQuantity: number }) => {
      const response = await api.patch(`/admin/variants/${variantId}`, { stockQuantity });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });

  // Upload product images
  const uploadImages = useMutation({
    mutationFn: async ({ productId, files }: { productId: string; files: File[] }) => {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      
      const response = await api.post(`/admin/products/${productId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, variables.productId] });
    },
  });

  return {
    useProducts,
    useProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    updateVariantStock,
    uploadImages,
  };
}
