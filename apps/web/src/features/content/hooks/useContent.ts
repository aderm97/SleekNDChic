import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { BlogPost, Page, CarouselItem, ApiResponse } from '@/shared/types';

const QUERY_KEYS = {
  blogPosts: ['blog', 'posts'] as const,
  blogPost: (slug: string) => ['blog', 'post', slug] as const,
  page: (slug: string) => ['page', slug] as const,
  carousel: ['carousel'] as const,
};

export function useBlogPosts() {
  return useQuery({
    queryKey: QUERY_KEYS.blogPosts,
    queryFn: async () => {
      const response = await api.get<ApiResponse<BlogPost[]>>('/blog/posts');
      return response.data;
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.blogPost(slug),
    queryFn: async () => {
      const response = await api.get<ApiResponse<BlogPost>>(`/blog/posts/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });
}

export function usePage(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.page(slug),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Page>>(`/content/pages/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });
}

export function useCarousel() {
  return useQuery({
    queryKey: QUERY_KEYS.carousel,
    queryFn: async () => {
      const response = await api.get<ApiResponse<CarouselItem[]>>('/carousel');
      return response.data;
    },
  });
}
