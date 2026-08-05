'use client';

// ============================================================================
// USE TRIPAY PAYMENT — polling status satu tagihan QRIS
// File: src/hooks/dashboard/use-tripay-payment.ts
// ============================================================================
//
// Dipakai halaman tunggu QR. Dua tanggung jawab:
//   1. Poll status pembayaran dari server (5 detik sekali)
//   2. Hitung sisa waktu QR untuk countdown
//
// ⚠️ SERVER YANG MENENTUKAN, BUKAN COUNTDOWN.
//
// Countdown di bawah dihitung dari jam perangkat, dan jam perangkat bisa
// salah atau diubah user. Karena itu countdown hanya KOSMETIK — yang
// benar-benar menentukan QR masih berlaku atau tidak adalah `status` dari
// server. Kalau countdown habis tapi server masih bilang PENDING, kita
// tampilkan "memeriksa..." dan tetap polling; kalau server bilang EXPIRED
// sementara countdown masih jalan, server yang menang.
//
// Ini juga yang membuat kita tidak perlu sinkronisasi jam server yang rumit.

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi, type TripayPaymentStatus } from '@/lib/api/subscription';
import { queryKeys } from '@/lib/shared/query-keys';

/** Status yang tidak akan berubah lagi — polling dihentikan. */
const FINAL_STATUSES: readonly TripayPaymentStatus[] = [
  'PAID',
  'FAILED',
  'EXPIRED',
  'REFUNDED',
];

const POLL_INTERVAL_MS = 5_000;

export function useTripayPayment(paymentId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    // Kalau proyek ini punya queryKeys.subscription.tripayPayment(), pakai itu.
    // Literal array dipakai supaya patch ini tidak perlu menyunting
    // query-keys.ts yang dipakai banyak modul lain.
    queryKey: [...queryKeys.subscription.plan(), 'tripay-payment', paymentId],
    queryFn: () => subscriptionApi.getTripayPayment(paymentId),
    // Berhenti polling begitu status final — tidak ada gunanya terus
    // menembak server untuk jawaban yang tidak akan berubah.
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (status && FINAL_STATUSES.includes(status)) return false;
      return POLL_INTERVAL_MS;
    },
    // Tetap polling walau tab tidak fokus: seller sering pindah ke aplikasi
    // e-wallet untuk scan QR, lalu kembali. Kalau polling berhenti saat tab
    // di background, ia kembali ke halaman yang masih menampilkan "menunggu"
    // padahal sudah lunas.
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    retry: 2,
    staleTime: 0,
  });

  const status = query.data?.status;
  const isPaid = status === 'PAID';

  // Saat lunas, cache plan di-invalidate supaya seluruh UI (sidebar, badge
  // tier, limit produk) langsung membaca tier baru tanpa reload manual.
  useEffect(() => {
    if (!isPaid) return;
    void queryClient.invalidateQueries({
      queryKey: queryKeys.subscription.plan(),
    });
  }, [isPaid, queryClient]);

  // ── Countdown ────────────────────────────────────────────────────────────
  const expiresAt = query.data?.expiresAt;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt || (status && FINAL_STATUSES.includes(status))) return;
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, [expiresAt, status]);

  const remainingMs = useMemo(() => {
    if (!expiresAt) return null;
    return Math.max(0, new Date(expiresAt).getTime() - now);
  }, [expiresAt, now]);

  const countdown = useMemo(() => {
    if (remainingMs === null) return null;
    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [remainingMs]);

  return {
    payment: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    status,
    isPaid,
    isFinal: status ? FINAL_STATUSES.includes(status) : false,
    /**
     * Countdown habis MENURUT JAM PERANGKAT. Bukan kebenaran — server yang
     * menentukan. Dipakai UI untuk menampilkan "memeriksa status..." alih-alih
     * countdown negatif, sambil polling tetap berjalan.
     */
    isCountdownElapsed: remainingMs !== null && remainingMs <= 0,
    countdown,
    refetch: query.refetch,
  };
}
