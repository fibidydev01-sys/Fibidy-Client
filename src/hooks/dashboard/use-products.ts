'use client';

// ==========================================
// USE PRODUCTS — TanStack Query
// Menggantikan: useState+useEffect manual + products-store
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productsApi } from '@/lib/api/products';
import { getErrorMessage } from '@/lib/api/client';
import { queryKeys } from '@/lib/shared/query-keys';
import type { ProductQueryParams, CreateProductInput, UpdateProductInput } from '@/types/product';

// ==========================================
// USE PRODUCTS — list dengan optional filters
// ==========================================

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params as Record<string, unknown>),
    queryFn: () => productsApi.getAll(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

// ==========================================
// USE PRODUCT CATEGORIES
// Di-derive dari cache products — tidak ada API call tambahan
// Fallback ke productsApi.getCategories() kalau cache kosong
// ==========================================

export function useProductCategories() {
  return useQuery({
    queryKey: queryKeys.products.categories(),
    queryFn: async () => {
      try {
        const categories = await productsApi.getCategories();
        if (Array.isArray(categories) && categories.length > 0) {
          return categories;
        }
      } catch {
        // Fallback ke ekstrak dari semua produk
      }

      const all = await productsApi.getAll({ limit: 200 });
      return [...new Set(
        all.data
          .map((p) => p.category)
          .filter((c): c is string => Boolean(c))
      )].sort();
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

// ==========================================
// USE CREATE PRODUCT
// ==========================================

export function useCreateProduct() {
  const queryClient = useQueryClient();

  const { mutate: createProduct, isPending: isLoading } = useMutation({
    mutationFn: (data: CreateProductInput) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success('Product added');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return { createProduct, isLoading };
}

// ==========================================
// USE UPDATE PRODUCT
// FIX: mutationFn terima { id, data } object — konsisten dengan cara panggil
// di product-form.tsx: updateProduct({ id: product.id, data: payload })
// ==========================================

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  const { mutate: updateProduct, isPending: isLoading } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success('Product updated');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return { updateProduct, isLoading };
}