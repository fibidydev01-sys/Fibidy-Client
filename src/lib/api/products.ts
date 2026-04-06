import { api } from './client';
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductQueryParams,
} from '@/types/product';
import type { PaginatedResponse } from '@/types/api';

export const productsApi = {
  getAll: async (params?: ProductQueryParams): Promise<PaginatedResponse<Product>> =>
    api.get<PaginatedResponse<Product>>('/products', { params }),

  getByStore: async (slug: string, params?: ProductQueryParams): Promise<PaginatedResponse<Product>> =>
    api.get<PaginatedResponse<Product>>(`/products/store/${slug}`, { params }),

  getById: async (id: string, headers?: HeadersInit): Promise<Product> =>
    api.get<Product>(`/products/${id}`, { headers }),

  getByStoreAndId: async (slug: string, productId: string): Promise<Product> =>
    api.get<Product>(`/products/store/${slug}/${productId}`),

  create: async (data: CreateProductInput): Promise<Product> =>
    api.post<Product>('/products', data),

  update: async (id: string, data: UpdateProductInput): Promise<Product> =>
    api.patch<Product>(`/products/${id}`, data),

  delete: async (id: string): Promise<{ message: string }> =>
    api.delete<{ message: string }>(`/products/${id}`),

  getCategories: async (headers?: HeadersInit): Promise<string[]> => {
    const response = await api.get<{ categories: string[] }>('/products/categories', { headers });
    return response.categories || [];
  },
};