'use client';

// ==========================================
// USE PRODUCTS — Unified
//
// All product hooks here:
//   - CRUD: useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct
//   - Categories: useProductCategories
//   - KYC: useKycStatus, useInitiateKyc, useKycReturnHandler
//   - Storage: useStorageUsage
//   - Upload: useUploadProduct
//   - Download: useDownloadHistory
//
// [TIDUR-NYENYAK v3.1 FIX]
// useKycReturnHandler: `setIsPolling(true)` was called unconditionally
// inside useEffect → react-hooks/set-state-in-effect error.
//
// v3 attempt (failed): functional updater with early-return guard —
// ESLint rule is stricter than expected and flags ANY setState call
// inside effect body.
//
// v3.1 fix: removed local isPolling state entirely. Derive from
// React Query's useIsFetching() which tracks in-flight KYC query
// globally. Zero local state, zero setState, same public API.
// useRef guard prevents re-handling on remounts.
// ==========================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient, useIsFetching } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productsApi } from '@/lib/api/products';
import { getErrorMessage } from '@/lib/api/client';
import { queryKeys } from '@/lib/shared/query-keys';
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
// USE PRODUCT CATEGORIES
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
        // Fallback to extraction from all products
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

// ==========================================
// USE UPDATE PRODUCT FILE — update file-product metadata
// ==========================================

export function useUpdateProductFile() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductFileInput;
    }) => productsApi.updateFile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success('Product updated');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return { updateProduct: mutate, isLoading: isPending };
}

// ==========================================
// USE DELETE PRODUCT
// ==========================================

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.storage(),
      });
      toast.success('Product deleted');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return { deleteProduct: mutate, isLoading: isPending };
}

// ==========================================
// KYC
// ==========================================

export function useKycStatus() {
  return useQuery({
    queryKey: queryKeys.products.kyc(),
    queryFn: () => productsApi.getKycStatus(),
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
// Bonus: Uses a useRef guard to prevent re-firing on remounts/re-renders.
// ==========================================

export function useKycReturnHandler() {
  const queryClient = useQueryClient();
  const hasHandledRef = useRef(false);

  // Track whether the KYC query is currently refetching.
  // `useIsFetching` returns count of in-flight matching queries (0 = idle).
  const fetchingCount = useIsFetching({ queryKey: queryKeys.products.kyc() });
  const isPolling = fetchingCount > 0;

  useEffect(() => {
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
// ==========================================

export function useStorageUsage() {
  return useQuery({
    queryKey: queryKeys.products.storage(),
    queryFn: () => productsApi.getStorageUsage(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

// ==========================================
// UPLOAD PRODUCT (with file)
// ==========================================

export function useUploadProduct() {
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
          queryKey: queryKeys.products.storage(),
        });

        toast.success('Product added');
        return result.product;
      } catch (err) {
        toast.error(getErrorMessage(err));
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [queryClient],
  );

  return { upload, isUploading, uploadProgress };
}

// ==========================================
// DOWNLOAD HISTORY
// ==========================================

export function useDownloadHistory(params?: {
  productId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.products.downloads(params),
    queryFn: () => productsApi.getDownloadHistory(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}