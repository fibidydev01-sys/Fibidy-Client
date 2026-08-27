'use client';

// ==========================================
// USE PRODUCTS — Unified
// File: src/hooks/dashboard/use-products.ts
//
// All product hooks here:
//   - CRUD: useProducts, useProduct, useCreateProduct, useUpdateProduct, useDeleteProduct
//   - Categories: useProductCategories (with optional `includeCategory` inject)
//
// ==========================================
// [REALTIME REFRESH FIX — May 2026]
// ==========================================
//
// Problem (pre-refactor):
//   - `new/page.tsx` and `edit/page.tsx` bypassed TanStack Query
//     entirely — using `useState` + `useEffect` + raw productsApi
//     calls. This meant:
//       1. Categories cached locally per page mount; new categories
//          added via product creation never propagated until full
//          page reload.
//       2. Edit page held a stale Product snapshot in local state.
//       3. Cache invalidation in mutations had no effect on these
//          pages since they didn't subscribe to any query.
//
//   - All mutations invalidated `queryKeys.products.all` but NOT
//     `queryKeys.products.categories()`. Even if pages used TanStack,
//     category list would still go stale after creating/editing a
//     product with a new category.
//
// Fixes applied here:
//   1. Added `useProduct(id)` — proper TanStack-backed hook for
//      single-product fetch. Replaces raw fetch in edit page.
//
//   2. `useProductCategories(includeCategory?)` now accepts an
//      optional `includeCategory` param. Used `select` (not queryKey)
//      so all consumers share a single cache entry — the param
//      just transforms the returned array. This preserves the
//      "inject current product's category into datalist even if
//      not yet fetched" behavior from the old edit page.
//
//   3. ALL mutations now also invalidate
//      `queryKeys.products.categories()`:
//        - useCreateProduct
//        - useUpdateProduct
//        - useDeleteProduct       (last product of a category gone)
//
//   4. Mutations also invalidate `queryKeys.products.detail(id)`
//      where applicable, so edit page reflects fresh server state
//      after save.
//
// [PANGKAS PRODUK DIGITAL] Hook KYC, storage, upload, dan riwayat unduhan
// sudah dicabut seluruhnya bersama fiturnya.
// ==========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { productsApi } from '@/lib/api/products';
import { getErrorMessage } from '@/lib/api/client';
import { queryKeys } from '@/lib/shared/query-keys';
import type {
  ProductQueryParams,
  CreateProductInput,
  UpdateProductInput,
} from '@/types/product';

// ==========================================
// USE PRODUCTS — list with optional filters
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
// USE PRODUCTS FLAT — dashboard list (unwrap pagination)
// Uses separate queryKey to avoid cache collision with useProducts()
// ==========================================

export function useProductsFlat() {
  return useQuery({
    queryKey: queryKeys.products.flat(),
    queryFn: () => productsApi.getAllFlat(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

// ==========================================
// USE PRODUCT — single product detail
//
// New in this refactor. Replaces the raw fetch previously done in
// `edit/page.tsx`. Backed by TanStack so:
//   - Edit page reflects mutation results without a manual refetch
//   - Multiple components mounting the same product share one cache
//   - `enabled: !!id` prevents the query firing on first render
//     before route params resolve
// ==========================================

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: () => productsApi.getById(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    // Don't retry 404s — let the page show notFound() quickly.
    retry: (failureCount, err) => {
      const status = (err as { statusCode?: number })?.statusCode;
      if (status === 404) return false;
      return failureCount < 1;
    },
  });
}

// ==========================================
// USE PRODUCT CATEGORIES
//
// `includeCategory` (optional):
//   When provided AND not already in the fetched list, the value is
//   merged in. Used by edit page so a product's existing category
//   always appears in the datalist — even if the seller's category
//   list happens not to include it yet (e.g. it was just deleted
//   from elsewhere, or there's a race).
//
// Why `select` instead of queryKey:
//   - Keeps a single cache entry for the categories list. Without
//     this, each unique `includeCategory` would create a new cache
//     row, fragmenting the cache and triggering extra refetches.
//   - `select` runs per-subscriber, so each consumer sees its own
//     merged result without affecting other consumers' views.
//   - TanStack memoizes `select` output by reference equality, so
//     identical inputs return the same array reference and avoid
//     unnecessary re-renders.
// ==========================================

export function useProductCategories(includeCategory?: string) {
  return useQuery({
    queryKey: queryKeys.products.categories(),
    queryFn: async () => {
      try {
        const categories = await productsApi.getCategories();
        if (Array.isArray(categories) && categories.length > 0) {
          return categories;
        }
      } catch {
        // Fallback to extraction from all products
      }

      const all = await productsApi.getAll({ limit: 200 });
      return [
        ...new Set(
          all.data
            .map((p) => p.category)
            .filter((c): c is string => Boolean(c)),
        ),
      ].sort();
    },
    select: (data) => {
      if (!includeCategory) return data;
      if (data.includes(includeCategory)) return data;
      return [includeCategory, ...data].sort();
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

// ==========================================
// USE CREATE PRODUCT
//
// [REALTIME FIX] Also invalidates categories — a new product may
// introduce a new category.
// ==========================================

export function useCreateProduct() {
  const tToast = useTranslations('toast.products');
  const queryClient = useQueryClient();

  const { mutate: createProduct, isPending: isLoading } = useMutation({
    mutationFn: (data: CreateProductInput) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.categories(),
      });
      toast.success(tToast('added'));
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return { createProduct, isLoading };
}

// ==========================================
// USE UPDATE PRODUCT
//
// [REALTIME FIX] Also invalidates categories + the specific detail
// row so edit pages elsewhere reflect new data.
// ==========================================

export function useUpdateProduct() {
  const tToast = useTranslations('toast.products');
  const queryClient = useQueryClient();

  const { mutate: updateProduct, isPending: isLoading } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productsApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.categories(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(variables.id),
      });
      toast.success(tToast('updated'));
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return { updateProduct, isLoading };
}

// ==========================================
// USE DELETE PRODUCT
//
// [REALTIME FIX] Also invalidates categories — if this was the last
// product in its category, the category should disappear from list.
// ==========================================

export function useDeleteProduct() {
  const tToast = useTranslations('toast.products');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.categories(),
      });
      toast.success(tToast('deleted'));
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return { deleteProduct: mutate, isLoading: isPending };
}
