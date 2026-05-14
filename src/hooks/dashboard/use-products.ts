'use client';

// ==========================================
// USE PRODUCTS — Unified
// File: src/hooks/dashboard/use-products.ts
//
// All product hooks here:
//   - CRUD: useProducts, useProduct, useCreateProduct, useUpdateProduct, useDeleteProduct
//   - Categories: useProductCategories (with optional `includeCategory` inject)
//   - KYC: useKycStatus, useInitiateKyc, useKycReturnHandler
//   - Storage: useStorageUsage
//   - Upload: useUploadProduct
//   - Download: useDownloadHistory
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
//        - useUpdateProductFile
//        - useDeleteProduct       (last product of a category gone)
//        - useUploadProduct       (file-upload create path)
//
//   4. Mutations also invalidate `queryKeys.products.detail(id)`
//      where applicable, so edit page reflects fresh server state
//      after save.
//
// [PHASE 3 — DIGITAL PRODUCTS FLAG]
// All digital-only hooks remain gated via React Query's `enabled`:
//   - useKycStatus, useStorageUsage, useDownloadHistory
//   - useKycReturnHandler (early-return on flag off)
// ==========================================

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useIsFetching,
} from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { productsApi } from '@/lib/api/products';
import { getErrorMessage } from '@/lib/api/client';
import { queryKeys } from '@/lib/shared/query-keys';
import { FEATURES } from '@/lib/config/features';
import type {
  ProductQueryParams,
  CreateProductInput,
  UpdateProductInput,
  UpdateProductFileInput,
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
// USE UPDATE PRODUCT FILE — update file-product metadata
//
// [REALTIME FIX] Same invalidation set as useUpdateProduct.
// ==========================================

export function useUpdateProductFile() {
  const tToast = useTranslations('toast.products');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductFileInput;
    }) => productsApi.updateFile(id, data),
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

  return { updateProduct: mutate, isLoading: isPending };
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.storage(),
      });
      toast.success(tToast('deleted'));
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return { deleteProduct: mutate, isLoading: isPending };
}

// ==========================================
// KYC
//
// [PHASE 3] Skip fetch when digital-products feature flag off.
// Without this, the query fires → backend returns 503 → console noise.
// ==========================================

export function useKycStatus() {
  return useQuery({
    queryKey: queryKeys.products.kyc(),
    queryFn: () => productsApi.getKycStatus(),
    enabled: FEATURES.digitalProducts,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useInitiateKyc() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => productsApi.initiateKyc(),
    onSuccess: (data) => {
      window.location.href = data.onboardingUrl;
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.kyc(),
      });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return { initiateKyc: mutate, isLoading: isPending };
}

// ==========================================
// KYC RETURN HANDLER
//
// [v3.1 FIX] Completely removed local setState from effect.
//
// Previous approach (v3): `setIsPolling((prev) => (prev ? prev : true))` —
// ESLint rule `react-hooks/set-state-in-effect` is stricter than expected
// and flags ANY setState call inside effect body, regardless of whether
// the functional updater is a no-op.
//
// New approach (v3.1): Derive `isPolling` from React Query's `useIsFetching`
// which tracks in-flight queries globally. When the effect triggers
// `invalidateQueries`, the KYC query starts refetching → `useIsFetching`
// returns > 0 → `isPolling` is true. Zero local state, zero setState,
// same external API.
//
// [PHASE 3] When flag is off, the effect early-returns and `isPolling`
// is permanently false. KYC query is gated by useKycStatus's `enabled`,
// so invalidation here is also a no-op.
// ==========================================

export function useKycReturnHandler() {
  const queryClient = useQueryClient();
  const hasHandledRef = useRef(false);

  // Track whether the KYC query is currently refetching.
  // `useIsFetching` returns count of in-flight matching queries (0 = idle).
  const fetchingCount = useIsFetching({ queryKey: queryKeys.products.kyc() });
  const isPolling = fetchingCount > 0;

  useEffect(() => {
    // [PHASE 3] Skip entirely when feature is off
    if (!FEATURES.digitalProducts) return;

    if (typeof window === 'undefined') return;
    if (hasHandledRef.current) return;

    const url = new URL(window.location.href);
    if (url.searchParams.get('kyc') !== 'return') return;

    hasHandledRef.current = true;
    url.searchParams.delete('kyc');
    window.history.replaceState({}, '', url.toString());

    // Trigger refetch — isPolling becomes true via useIsFetching
    // No setState called from inside this effect body.
    queryClient.invalidateQueries({ queryKey: queryKeys.products.kyc() });
  }, [queryClient]);

  return { isPolling };
}

// ==========================================
// STORAGE
//
// [PHASE 3] Skip fetch when digital-products feature flag off.
// ==========================================

export function useStorageUsage() {
  return useQuery({
    queryKey: queryKeys.products.storage(),
    queryFn: () => productsApi.getStorageUsage(),
    enabled: FEATURES.digitalProducts,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

// ==========================================
// UPLOAD PRODUCT (with file)
//
// [REALTIME FIX] Also invalidates categories — a new file-product
// may carry a category (set via the subsequent .update() call from
// product-form.tsx).
// ==========================================

export function useUploadProduct() {
  const tToast = useTranslations('toast.products');
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(
    async (
      file: File,
      productData: { name: string; description?: string; price: number },
    ) => {
      setIsUploading(true);
      setUploadProgress(0);

      try {
        const fileSizeMb = file.size / (1024 * 1024);
        const fileType = file.name.split('.').pop()?.toLowerCase() ?? '';

        const { uploadUrl, fileKey } = await productsApi.initiateUpload({
          fileName: file.name,
          fileType,
          fileSizeMb,
        });

        await productsApi.uploadToR2(
          uploadUrl,
          file,
          file.type || 'application/octet-stream',
          (percent) => setUploadProgress(percent),
        );

        setUploadProgress(100);

        const result = await productsApi.confirmUpload({
          fileKey,
          fileName: file.name,
          fileType,
          fileSizeMb,
          name: productData.name,
          description: productData.description,
          price: productData.price,
        });

        queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        queryClient.invalidateQueries({
          queryKey: queryKeys.products.categories(),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.products.storage(),
        });

        toast.success(tToast('added'));
        return result.product;
      } catch (err) {
        toast.error(getErrorMessage(err));
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [queryClient, tToast],
  );

  return { upload, isUploading, uploadProgress };
}

// ==========================================
// DOWNLOAD HISTORY
//
// [PHASE 3] Skip fetch when digital-products feature flag off.
// ==========================================

export function useDownloadHistory(params?: {
  productId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.products.downloads(params),
    queryFn: () => productsApi.getDownloadHistory(params),
    enabled: FEATURES.digitalProducts,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}
