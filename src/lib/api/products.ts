import { api } from './client';
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductQueryParams,
  CreateProductUploadInput,
  UpdateProductFileInput,
  InitiateUploadResponse,
  InitiateKycResponse,
  KycStatusResponse,
  StorageUsage,
  DownloadHistoryResponse,
} from '@/types/product';
import type { PaginatedResponse } from '@/types/api';

export const productsApi = {
  // ── CRUD ────────────────────────────────────────────────────────

  getAll: async (params?: ProductQueryParams): Promise<PaginatedResponse<Product>> =>
    api.get<PaginatedResponse<Product>>('/products', { params }),

  /** Flat array — untuk dashboard list (unwrap pagination) */
  getAllFlat: async (): Promise<Product[]> => {
    const res = await api.get<PaginatedResponse<Product>>('/products');
    return res.data;
  },

  getByStore: async (slug: string, params?: ProductQueryParams): Promise<PaginatedResponse<Product>> =>
    api.get<PaginatedResponse<Product>>(`/products/store/${slug}`, { params }),

  getById: async (id: string): Promise<Product> =>
    api.get<Product>(`/products/${id}`),

  getByStoreAndId: async (slug: string, productId: string): Promise<Product> =>
    api.get<Product>(`/products/store/${slug}/${productId}`),

  create: async (data: CreateProductInput): Promise<Product> =>
    api.post<Product>('/products', data),

  update: async (id: string, data: UpdateProductInput): Promise<Product> =>
    api.patch<Product>(`/products/${id}`, data),

  updateFile: async (id: string, data: UpdateProductFileInput): Promise<Product> =>
    api.patch<Product>(`/products/${id}`, data),

  delete: async (id: string): Promise<{ message: string }> =>
    api.delete<{ message: string }>(`/products/${id}`),

  getCategories: async (): Promise<string[]> => {
    const response = await api.get<{ categories: string[] }>('/products/categories');
    return response.categories || [];
  },

  // ── KYC ────────────────────────────────────────────────────────

  initiateKyc: (): Promise<InitiateKycResponse> =>
    api.post('/products/kyc/initiate'),

  getKycStatus: (): Promise<KycStatusResponse> =>
    api.get('/products/kyc/status'),

  // ── Upload Flow ─────────────────────────────────────────────────

  initiateUpload: (data: {
    fileName: string;
    fileType: string;
    fileSizeMb: number;
  }): Promise<InitiateUploadResponse> =>
    api.post('/products/upload/initiate', data),

  uploadToR2: async (
    uploadUrl: string,
    file: File,
    mimeType: string,
    onProgress?: (percent: number) => void,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', mimeType);

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Upload network error'));
      xhr.send(file);
    });
  },

  confirmUpload: (data: CreateProductUploadInput): Promise<{
    message: string;
    product: Product;
  }> => api.post('/products/upload/confirm', data),

  // ── Storage ─────────────────────────────────────────────────────

  getStorageUsage: (): Promise<StorageUsage> =>
    api.get('/products/storage/usage'),

  // ── Download History ────────────────────────────────────────────

  getDownloadHistory: (params?: {
    productId?: string;
    page?: number;
    limit?: number;
  }): Promise<DownloadHistoryResponse> =>
    api.get('/products/downloads', { params }),
};