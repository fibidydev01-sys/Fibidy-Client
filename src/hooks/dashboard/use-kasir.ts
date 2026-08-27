'use client';

// ============================================================================
// USE KASIR — semua hook modul kasir
// File: src/hooks/dashboard/use-kasir.ts
//
// Pola invalidasi mengikuti kenyataan di server: satu transaksi menyentuh
// stok, daftar produk, dan ringkasan dashboard sekaligus. Karena itu mutasi
// yang menggeser stok meng-invalidate `queryKeys.kasir.all` — lebih murah
// daripada melacak satu per satu dan lupa satu.
//
// Toast sukses / dialog gagal mengikuti aturan UI: aksi berhasil cukup toast
// yang hilang sendiri, aksi gagal dilempar ke pemanggil supaya bisa
// ditampilkan sebagai dialog yang harus ditutup manual.
// ============================================================================

import { useMemo } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { isKasirPlanRequired, kasirApi } from '@/lib/api/kasir';
import { getErrorMessage } from '@/lib/api/client';
import { queryKeys } from '@/lib/shared/query-keys';
import { useKasirLock } from './use-kasir-lock';
import type {
  BayarTransaksiInput,
  CreateDiskonPresetInput,
  CreatePromoRuleInput,
  CreateTransaksiInput,
  QueryTransaksiParams,
  UpdateKasirConfigInput,
  UpdateStatusItemInput,
} from '@/types/kasir';

// Data kasir berubah terus (stok, omzet), tapi tidak perlu se-fresh milidetik.
const STALE_PENDEK = 1000 * 30;
const STALE_SEDANG = 1000 * 60 * 5;

// [UI/UX — Agu 2026] Query yang query key-nya ikut berubah saat pengguna
// mengetik (pencarian), menggeser halaman, atau berganti filter WAJIB memakai
// ini. Tanpa keepPreviousData, setiap perubahan key menghasilkan cache miss →
// isLoading true → daftar diganti skeleton → daftar muncul lagi. Di layar
// kasir itu terbaca sebagai layar yang berkedip setiap ketikan.
//
// Dengan keepPreviousData, data lama bertahan sampai yang baru datang dan
// halaman cukup meredupkannya lewat isFetching.
const jagaDataSebelumnya = { placeholderData: keepPreviousData } as const;

// Gerbang paket (403 KASIR_PLAN_REQUIRED) tidak akan berubah kalau dicoba
// ulang — retry hanya menunda tampilnya layar upgrade.
function retryKecualiKlien(failureCount: number, error: unknown) {
  const status = (error as { statusCode?: number })?.statusCode;
  if (status === 403 || status === 404) return false;
  return failureCount < 1;
}

// ── Gerbang paket untuk SETIAP mutasi ───────────────────────────────────────
//
// Semua hook mutasi di berkas ini memakai `useKasirMutation`, bukan
// `useMutation` langsung. Untuk tenant FREE, `mutate` diganti penjelasan —
// permintaannya TIDAK PERNAH berangkat.
//
// Kenapa mengganti `mutate` alih-alih menolak di dalam `mutationFn`: menolak
// di sana berarti janjinya ditolak, `onError` berjalan, dan penjual menerima
// toast GALAT untuk sesuatu yang bukan galat. Yang benar bukan "gagal",
// melainkan "belum tersedia di paketmu" — dan itu satu pesan, bukan dua.
//
// `terkunci` ikut dikembalikan supaya tombol bisa memasang mahkota tanpa
// memanggil hook paket lagi sendiri-sendiri.
function useKasirMutation<TData, TError, TVars, TCtx>(
  options: UseMutationOptions<TData, TError, TVars, TCtx>,
) {
  const { terkunci, jelaskan } = useKasirLock();
  const mutation = useMutation({
    ...options,
    // Jaring pengaman kalau gerbang klien BOCOR — tombol yang lupa dijaga,
    // atau paket yang habis persis saat halaman sedang terbuka. Server
    // menolaknya 403 KASIR_PLAN_REQUIRED, dan tanpa cabang ini penjual
    // menerima pesan galat mentah untuk sesuatu yang bukan galat.
    onError: (...args) => {
      if (isKasirPlanRequired(args[0])) {
        jelaskan();
        return;
      }
      options.onError?.(...args);
    },
  });

  return useMemo(() => {
    if (!terkunci) return { ...mutation, terkunci };
    return {
      ...mutation,
      terkunci,
      mutate: (() => jelaskan()) as typeof mutation.mutate,
      mutateAsync: (() => {
        jelaskan();
        // Janji yang TIDAK PERNAH selesai akan menggantungkan pemanggil yang
        // menunggunya. Ditolak dengan alasan yang jelas supaya `await` di
        // pemanggil berakhir, dan pesannya sudah keluar lewat `jelaskan()`.
        return Promise.reject(new Error('KASIR_TERKUNCI'));
      }) as typeof mutation.mutateAsync,
    };
  }, [mutation, terkunci, jelaskan]);
}

// ── Config ──────────────────────────────────────────────────────────────────

export function useKasirConfig(
  options?: Partial<UseQueryOptions<Awaited<ReturnType<typeof kasirApi.getConfig>>>>,
) {
  return useQuery({
    queryKey: queryKeys.kasir.config(),
    queryFn: () => kasirApi.getConfig(),
    staleTime: STALE_SEDANG,
    retry: retryKecualiKlien,
    ...options,
  });
}

export function useUpdateKasirConfig() {
  const t = useTranslations('dashboard.kasir.toast');
  const queryClient = useQueryClient();

  return useKasirMutation({
    mutationFn: (data: UpdateKasirConfigInput) => kasirApi.updateConfig(data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.kasir.config(), data);
      toast.success(t('configSaved'));
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ── Produk kasir ────────────────────────────────────────────────────────────

export function useKasirProducts(params?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: queryKeys.kasir.products(params as Record<string, unknown>),
    queryFn: () => kasirApi.getProducts(params),
    staleTime: STALE_PENDEK,
    retry: retryKecualiKlien,
    ...jagaDataSebelumnya,
  });
}

export function useKasirCategories() {
  return useQuery({
    queryKey: queryKeys.kasir.categories(),
    queryFn: () => kasirApi.getCategories(),
    staleTime: STALE_SEDANG,
    retry: retryKecualiKlien,
  });
}

// ── Layanan ─────────────────────────────────────────────────────────────────

export function useKasirLayanan(params?: {
  search?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: queryKeys.kasir.layanan(params as Record<string, unknown>),
    queryFn: () => kasirApi.getLayanan(params),
    staleTime: STALE_PENDEK,
    retry: retryKecualiKlien,
    ...jagaDataSebelumnya,
  });
}

export function useKasirLayananCategories() {
  return useQuery({
    queryKey: queryKeys.kasir.layananCategories(),
    queryFn: () => kasirApi.getLayananCategories(),
    staleTime: STALE_SEDANG,
    retry: retryKecualiKlien,
  });
}

// ── Stok ────────────────────────────────────────────────────────────────────

export function useStockReport() {
  return useQuery({
    queryKey: queryKeys.kasir.stock(),
    queryFn: () => kasirApi.getStockReport(),
    staleTime: STALE_PENDEK,
    retry: retryKecualiKlien,
    ...jagaDataSebelumnya,
  });
}

export function useStockLog(
  productId: string | undefined,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: queryKeys.kasir.stockLog(
      productId ?? '',
      params as Record<string, unknown>,
    ),
    queryFn: () => kasirApi.getStockLog(productId as string, params),
    enabled: !!productId,
    staleTime: STALE_PENDEK,
  });
}

export function useRestock() {
  const t = useTranslations('dashboard.kasir.toast');
  const queryClient = useQueryClient();

  return useKasirMutation({
    mutationFn: ({
      productId,
      jumlah,
      catatan,
    }: {
      productId: string;
      jumlah: number;
      catatan?: string;
    }) => kasirApi.restock(productId, { jumlah, catatan }),
    onSuccess: (hasil) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kasir.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success(t('restockDone', { jumlah: hasil.ditambahkan }));
    },
  });
}

export function useOpname() {
  const queryClient = useQueryClient();

  return useKasirMutation({
    mutationFn: ({
      productId,
      stokFisik,
      catatan,
    }: {
      productId: string;
      stokFisik: number;
      catatan?: string;
    }) => kasirApi.opname(productId, { stokFisik, catatan }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kasir.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

// ── Preset diskon ───────────────────────────────────────────────────────────

export function useDiskonPresets() {
  return useQuery({
    queryKey: queryKeys.kasir.presets(),
    queryFn: () => kasirApi.getDiskonPresets(),
    staleTime: STALE_SEDANG,
    retry: retryKecualiKlien,
  });
}

export function useCreateDiskonPreset() {
  const t = useTranslations('dashboard.kasir.toast');
  const queryClient = useQueryClient();

  return useKasirMutation({
    mutationFn: (data: CreateDiskonPresetInput) =>
      kasirApi.createDiskonPreset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kasir.presets() });
      toast.success(t('presetCreated'));
    },
  });
}

export function useUpdateDiskonPreset() {
  const t = useTranslations('dashboard.kasir.toast');
  const queryClient = useQueryClient();

  return useKasirMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateDiskonPresetInput>;
    }) => kasirApi.updateDiskonPreset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kasir.presets() });
      toast.success(t('presetUpdated'));
    },
  });
}

export function useDeleteDiskonPreset() {
  const t = useTranslations('dashboard.kasir.toast');
  const queryClient = useQueryClient();

  return useKasirMutation({
    mutationFn: (id: string) => kasirApi.deleteDiskonPreset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kasir.presets() });
      toast.success(t('presetDeleted'));
    },
  });
}

// ── Program promo ───────────────────────────────────────────────────────────

export function usePromoRules() {
  return useQuery({
    queryKey: queryKeys.kasir.promos(),
    queryFn: () => kasirApi.getPromoRules(),
    staleTime: STALE_SEDANG,
    retry: retryKecualiKlien,
  });
}

export function usePromoRulesAktif() {
  return useQuery({
    queryKey: queryKeys.kasir.promosAktif(),
    queryFn: () => kasirApi.getPromoRulesAktif(),
    staleTime: STALE_PENDEK,
    retry: retryKecualiKlien,
  });
}

export function useCreatePromoRule() {
  const t = useTranslations('dashboard.kasir.toast');
  const queryClient = useQueryClient();

  return useKasirMutation({
    mutationFn: (data: CreatePromoRuleInput) => kasirApi.createPromoRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kasir.promos() });
      queryClient.invalidateQueries({ queryKey: queryKeys.kasir.promosAktif() });
      toast.success(t('promoCreated'));
    },
  });
}

export function useDeletePromoRule() {
  const t = useTranslations('dashboard.kasir.toast');
  const queryClient = useQueryClient();

  return useKasirMutation({
    mutationFn: (id: string) => kasirApi.deletePromoRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kasir.promos() });
      queryClient.invalidateQueries({ queryKey: queryKeys.kasir.promosAktif() });
      toast.success(t('promoDeleted'));
    },
  });
}

// ── Transaksi ───────────────────────────────────────────────────────────────

export function useCreateTransaksi() {
  const queryClient = useQueryClient();

  return useKasirMutation({
    mutationFn: (data: CreateTransaksiInput) => kasirApi.createTransaksi(data),
    onSuccess: () => {
      // Transaksi menggeser stok, omzet, dan daftar produk sekaligus.
      queryClient.invalidateQueries({ queryKey: queryKeys.kasir.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useTransaksis(params?: QueryTransaksiParams) {
  return useQuery({
    queryKey: queryKeys.kasir.transaksis(params as Record<string, unknown>),
    queryFn: () => kasirApi.getTransaksis(params),
    staleTime: STALE_PENDEK,
    retry: retryKecualiKlien,
    ...jagaDataSebelumnya,
  });
}

export function useTransaksi(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.kasir.transaksi(id ?? ''),
    queryFn: () => kasirApi.getTransaksi(id as string),
    enabled: !!id,
    staleTime: STALE_SEDANG,
    retry: retryKecualiKlien,
  });
}

export function useStruk(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.kasir.struk(id ?? ''),
    queryFn: () => kasirApi.getStruk(id as string),
    enabled: !!id,
    staleTime: STALE_SEDANG,
  });
}

/// [JASA] Pelunasan pesanan. Meng-invalidate seluruh cabang kasir karena
/// pembayaran menggeser omzet, papan kerja, dan daftar riwayat sekaligus.
export function useBayarTransaksi() {
  const t = useTranslations('dashboard.kasir.toast');
  const queryClient = useQueryClient();

  return useKasirMutation({
    mutationFn: ({ id, data }: { id: string; data: BayarTransaksiInput }) =>
      kasirApi.bayarTransaksi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kasir.all });
      toast.success(t('bayarDone'));
    },
  });
}

export function useVoidTransaksi() {
  const t = useTranslations('dashboard.kasir.toast');
  const queryClient = useQueryClient();

  return useKasirMutation({
    mutationFn: ({ id, alasan }: { id: string; alasan?: string }) =>
      kasirApi.voidTransaksi(id, alasan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kasir.all });
      toast.success(t('voidDone'));
    },
  });
}

export function useRefundTransaksi() {
  const t = useTranslations('dashboard.kasir.toast');
  const queryClient = useQueryClient();

  return useKasirMutation({
    mutationFn: ({ id, alasan }: { id: string; alasan: string }) =>
      kasirApi.refundTransaksi(id, alasan),
    onSuccess: () => {
      // Refund mengembalikan stok — daftar produk ikut berubah.
      queryClient.invalidateQueries({ queryKey: queryKeys.kasir.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success(t('refundDone'));
    },
  });
}

// ── Papan Kerja ─────────────────────────────────────────────────────────────

/// [JASA] Papan tidak di-cache di server (lihat KasirPapanService), jadi
/// staleTime-nya pendek: papan yang menampilkan keadaan basi lebih berbahaya
/// daripada satu permintaan tambahan.
export function usePapanKerja(params?: {
  status?: 'BELUM_BAYAR' | 'COMPLETED';
}) {
  return useQuery({
    queryKey: queryKeys.kasir.papan(params),
    queryFn: () => kasirApi.getPapan(params),
    staleTime: STALE_PENDEK,
    retry: retryKecualiKlien,
  });
}

/// [JASA] Menggeser satu kartu. Yang di-invalidate cuma cabang papan dan
/// detail transaksinya — status pengerjaan tidak menyentuh uang, jadi
/// membatalkan cache omzet dan riwayat di sini hanya membuat layar lain
/// berkedip tanpa alasan (G2: dua sumbu, tidak saling menyetir).
export function useUpdateStatusItem() {
  const queryClient = useQueryClient();

  return useKasirMutation({
    mutationFn: (input: UpdateStatusItemInput) =>
      kasirApi.updateStatusItem(input),
    onSuccess: (_hasil, input) => {
      queryClient.invalidateQueries({ queryKey: ['kasir', 'papan'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.kasir.transaksi(input.transaksiId),
      });
    },
  });
}

// ── Dashboard / laporan ─────────────────────────────────────────────────────

export function useKasirRingkasan() {
  return useQuery({
    queryKey: queryKeys.kasir.dashboard(),
    queryFn: () => kasirApi.getRingkasan(),
    staleTime: STALE_PENDEK,
    retry: retryKecualiKlien,
  });
}

export function useAnalisaDiskon() {
  return useQuery({
    queryKey: queryKeys.kasir.analisaDiskon(),
    queryFn: () => kasirApi.getAnalisaDiskon(),
    staleTime: STALE_SEDANG,
    retry: retryKecualiKlien,
  });
}
