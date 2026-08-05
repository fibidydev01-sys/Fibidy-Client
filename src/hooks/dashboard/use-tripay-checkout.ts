'use client';

// ============================================================================
// USE TRIPAY CHECKOUT
// File: src/hooks/dashboard/use-tripay-checkout.ts
//
// Mengelola SATU niat bayar QRIS: membuat kunci idempotency, memanggil
// backend, mengarahkan ke halaman tunggu.
// ============================================================================

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { subscriptionApi } from '@/lib/api/subscription';
import { getErrorMessage, ApiRequestError } from '@/lib/api/client';

/** UUID v4. `crypto.randomUUID` tersedia di semua browser target + HTTPS. */
function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback defensif untuk konteks non-secure (http:// di jaringan lokal),
  // di mana crypto.randomUUID tidak tersedia.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useTripayCheckout() {
  const t = useTranslations('dashboard.subscription');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * ⚠️ INTI DARI SELURUH FILE INI.
   *
   * Kunci disimpan di ref, dibuat SEKALI saat percobaan bayar pertama untuk
   * satu tier, lalu DIPAKAI ULANG untuk setiap klik berikutnya.
   *
   * Kalau kunci dibuat di dalam handler klik, klik kedua menghasilkan kunci
   * berbeda → server melihat dua niat bayar berbeda → dua transaksi terbit
   * di Tripay → dua QR aktif untuk satu tagihan. Kalau dua-duanya dibayar,
   * uang masuk dua kali dan harus dikembalikan manual.
   *
   * Kunci direset hanya kalau seller sengaja memulai niat bayar BARU
   * (ganti tier, atau memanggil resetIntent() setelah keluar dari alur).
   */
  const keyRef = useRef<{ tier: string; key: string } | null>(null);

  const resolveKey = useCallback((tier: 'STARTER' | 'BUSINESS') => {
    if (keyRef.current?.tier === tier) return keyRef.current.key;
    const key = createIdempotencyKey();
    keyRef.current = { tier, key };
    return key;
  }, []);

  /** Dipanggil saat seller benar-benar meninggalkan alur bayar. */
  const resetIntent = useCallback(() => {
    keyRef.current = null;
  }, []);

  const startCheckout = useCallback(
    async (tier: 'STARTER' | 'BUSINESS') => {
      setIsLoading(true);
      try {
        const result = await subscriptionApi.createTripayCheckout(
          tier,
          resolveKey(tier),
        );

        // `reused` = server mengembalikan tagihan yang sudah ada, bukan baru.
        // Diberitahukan supaya seller tidak mengira ia baru saja membuat
        // tagihan kedua.
        if (result.reused) {
          toast.info(t('tripay.reusedNotice'));
        }

        router.push(`/dashboard/subscription/pay/${result.paymentId}`);
        return result;
      } catch (err) {
        // 503 = Tripay tidak terjangkau. Baris pembayaran SUDAH dibuat di BE
        // dan dibiarkan PENDING supaya rekonsiliasi memeriksanya — jadi
        // pesannya tidak boleh bilang "gagal", karena transaksinya mungkin
        // justru sudah terbentuk di sisi Tripay.
        if (err instanceof ApiRequestError && err.statusCode === 503) {
          toast.error(t('tripay.unreachable'));
          return null;
        }
        // `t` di sini sudah ter-scope ke `dashboard.subscription`, jadi
        // TIDAK boleh diteruskan ke getErrorMessage — key error global
        // seperti `error.network.timeout` tidak akan resolve dari scope ini
        // dan yang tampil justru string key mentahnya.
        toast.error(getErrorMessage(err));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [resolveKey, router, t],
  );

  return { startCheckout, resetIntent, isLoading };
}
