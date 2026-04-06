'use client';

// ==========================================
// USE STORE URLS — Hook
// 'use client' wajib — pakai useMemo (React hook)
// Pure functions: lib/public/store-url.ts
// ==========================================

import { useMemo } from 'react';
import { productUrl, productsUrl, storeHomeUrl, storeUrl } from '@/lib/public/store-url';

export function useStoreUrls(storeSlug: string) {
  return useMemo(
    () => ({
      home: storeHomeUrl(storeSlug),
      products: (params?: Record<string, string | undefined>) =>
        productsUrl(storeSlug, params),
      product: (productId: string) => productUrl(storeSlug, productId),
      path: (path: string) => storeUrl(storeSlug, path),
    }),
    [storeSlug]
  );
}