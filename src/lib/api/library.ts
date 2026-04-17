// src/lib/api/library.ts

import { api } from './client';
import type { Purchase, DownloadUrlResponse } from '@/types/product';

export const libraryApi = {
  getLibrary: (): Promise<Purchase[]> =>
    api.get('/library'),

  getDownloadUrl: (purchaseId: string): Promise<DownloadUrlResponse> =>
    api.get(`/library/${purchaseId}/download`),
};