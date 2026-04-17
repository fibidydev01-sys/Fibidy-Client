// src/hooks/shared/use-preview.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { discoverApi } from '@/lib/api/discover';
import type { PreviewResponse } from '@/lib/api/discover';

// Re-export agar consumer tidak perlu import dari 2 tempat
export type { PreviewResponse };

/**
 * Fetch preview URL untuk produk digital.
 *
 * Preview URL = signed URL ke R2 dengan TTL 15 menit.
 * Kalau buyer stay di halaman > 15 menit, URL expired.
 * refreshPreview() di-expose untuk re-fetch saat render gagal.
 */
export function usePreview(productId: string) {
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreview = useCallback(async () => {
    setLoading(true);
    try {
      const data = await discoverApi.getPreviewUrl(productId);
      setPreview(data);
    } catch {
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  return {
    preview,
    loading,
    /** Re-fetch preview URL — panggil saat render PDF gagal (URL expired) */
    refreshPreview: fetchPreview,
  };
}