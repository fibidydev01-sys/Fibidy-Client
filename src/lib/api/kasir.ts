// ==========================================
// KASIR API
// File: src/lib/api/kasir.ts
//
// Semua endpoint di bawah /api/kasir dijaga JwtAuthGuard + KasirPlanGuard.
// Tenant FREE dapat 403 dengan code KASIR_PLAN_REQUIRED — dideteksi lewat
// isKasirPlanRequired() dan dibalas modal upgrade, bukan halaman error.
// ==========================================

import { api, ApiRequestError } from './client';
import type { PaginatedResponse } from '@/types/api';
import type {
  AnalisaDiskon,
  CreateDiskonPresetInput,
  CreatePromoRuleInput,
  CreateTransaksiInput,
  CreateTransaksiResult,
  DiskonPreset,
  KasirConfig,
  KasirProductsResponse,
  KasirRingkasan,
  KasirTransaksi,
  KasirTransaksiRingkas,
  LaporanStok,
  OmzetSummary,
  OpnameResult,
  PromoRule,
  PromoRuleAktif,
  QueryTransaksiParams,
  RestockResult,
  StockLog,
  StockReport,
  StrukResponse,
  TopProduk,
  UpdateKasirConfigInput,
} from '@/types/kasir';

/**
 * True kalau error-nya adalah gerbang paket (tenant FREE mencoba buka kasir).
 * Dipakai KasirPlanGate untuk menampilkan upsell alih-alih pesan error.
 */
export function isKasirPlanRequired(error: unknown): boolean {
  return (
    error instanceof ApiRequestError &&
    error.statusCode === 403 &&
    error.code === 'KASIR_PLAN_REQUIRED'
  );
}

export const kasirApi = {
  // ── Config ──────────────────────────────────────────────────────
  getConfig: (): Promise<KasirConfig> => api.get('/kasir/config'),

  updateConfig: (data: UpdateKasirConfigInput): Promise<KasirConfig> =>
    api.patch('/kasir/config', data),

  // ── Produk (read-only; CRUD tetap lewat /products) ──────────────
  getProducts: (params?: {
    search?: string;
    category?: string;
  }): Promise<KasirProductsResponse> => api.get('/kasir/products', { params }),

  getCategories: async (): Promise<string[]> => {
    const res = await api.get<{ categories: string[] }>(
      '/kasir/products/categories',
    );
    return res.categories ?? [];
  },

  // ── Stok ────────────────────────────────────────────────────────
  getStockReport: (): Promise<StockReport> => api.get('/kasir/stok'),

  getStockLog: (
    productId: string,
    params?: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<StockLog>> =>
    api.get(`/kasir/stok/${productId}/log`, { params }),

  restock: (
    productId: string,
    data: { jumlah: number; catatan?: string },
  ): Promise<RestockResult> =>
    api.patch(`/kasir/stok/${productId}/restock`, data),

  opname: (
    productId: string,
    data: { stokFisik: number; catatan?: string },
  ): Promise<OpnameResult> =>
    api.patch(`/kasir/stok/${productId}/opname`, data),

  // ── Preset diskon ───────────────────────────────────────────────
  getDiskonPresets: (): Promise<DiskonPreset[]> => api.get('/kasir/diskon-preset'),

  createDiskonPreset: (data: CreateDiskonPresetInput): Promise<DiskonPreset> =>
    api.post('/kasir/diskon-preset', data),

  updateDiskonPreset: (
    id: string,
    data: Partial<CreateDiskonPresetInput>,
  ): Promise<DiskonPreset> => api.patch(`/kasir/diskon-preset/${id}`, data),

  deleteDiskonPreset: (id: string): Promise<{ message: string }> =>
    api.delete(`/kasir/diskon-preset/${id}`),

  // ── Program promo ───────────────────────────────────────────────
  getPromoRules: (): Promise<PromoRule[]> => api.get('/kasir/promo-rule'),

  getPromoRulesAktif: (): Promise<PromoRuleAktif[]> =>
    api.get('/kasir/promo-rule/aktif'),

  createPromoRule: (data: CreatePromoRuleInput): Promise<PromoRule> =>
    api.post('/kasir/promo-rule', data),

  deletePromoRule: (id: string): Promise<{ message: string }> =>
    api.delete(`/kasir/promo-rule/${id}`),

  // ── Transaksi ───────────────────────────────────────────────────
  createTransaksi: (data: CreateTransaksiInput): Promise<CreateTransaksiResult> =>
    api.post('/kasir/transaksi', data),

  getTransaksis: (
    params?: QueryTransaksiParams,
  ): Promise<PaginatedResponse<KasirTransaksiRingkas>> =>
    api.get('/kasir/transaksi', {
      params: params as Record<string, string | number | undefined>,
    }),

  getTransaksi: (id: string): Promise<KasirTransaksi> =>
    api.get(`/kasir/transaksi/${id}`),

  getStruk: (id: string): Promise<StrukResponse> =>
    api.get(`/kasir/transaksi/${id}/struk`),

  voidTransaksi: (id: string, alasan?: string): Promise<KasirTransaksi> =>
    api.patch(`/kasir/transaksi/${id}/void`, { alasan }),

  refundTransaksi: (
    id: string,
    alasan: string,
  ): Promise<{ message: string; id: string; nomorOrder: string }> =>
    api.patch(`/kasir/transaksi/${id}/refund`, { alasan }),

  // ── Dashboard / laporan ─────────────────────────────────────────
  getRingkasan: (): Promise<KasirRingkasan> => api.get('/kasir/dashboard'),

  getOmzet: (): Promise<OmzetSummary> => api.get('/kasir/dashboard/omzet'),

  getTopProduk: (limit?: number): Promise<TopProduk[]> =>
    api.get('/kasir/dashboard/top-produk', { params: { limit } }),

  getAnalisaDiskon: (): Promise<AnalisaDiskon> =>
    api.get('/kasir/dashboard/analisa-diskon'),

  getLaporanStok: (): Promise<LaporanStok> =>
    api.get('/kasir/dashboard/laporan-stok'),
};
