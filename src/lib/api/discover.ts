// src/lib/api/discover.ts
// Public API — tidak butuh auth

import { api } from './client';
import type { DiscoverResponse, PublicProduct } from '@/types/product';

// ==========================================
// PREVIEW RESPONSE TYPE
// ==========================================

export interface PreviewResponse {
  previewUrl: string;
  previewData: { pageCount: number } | null;
  expiresIn: string;
  maxPreviewPages: number;
}

export const discoverApi = {
  getAll: (params?: {
    search?: string;
    fileType?: string;
    page?: number;
    limit?: number;
  }): Promise<DiscoverResponse> =>
    api.get('/discover', { params }),

  getById: (id: string): Promise<PublicProduct> =>
    api.get(`/discover/${id}`),

  // Preview URL — signed URL ke R2, TTL 15 menit
  getPreviewUrl: (id: string): Promise<PreviewResponse> =>
    api.get(`/discover/${id}/preview`),
};