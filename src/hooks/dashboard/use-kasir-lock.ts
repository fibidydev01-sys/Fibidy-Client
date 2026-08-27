'use client';

// ============================================================================
// USE KASIR LOCK — gerbang paket untuk SEMUA mutasi kasir
// File: src/hooks/dashboard/use-kasir-lock.ts
//
// ── KENAPA DI HOOK, BUKAN DI TOMBOL ────────────────────────────────────────
//
// Terhitung di modul kasir: 13 hook mutasi melawan 30-an tombol aksi.
// Menggantung gerbangnya di hook berarti dua hal sekaligus:
//
//   - dua kali lebih sedikit tempat untuk salah;
//   - tombol yang LUPA dimahkotai tetap tidak bisa menembak.
//
// Yang kedua itu yang menentukan. Kalau gerbangnya di tombol, satu tombol
// yang terlewat berarti permintaan sungguhan berangkat, server menolaknya
// 403, dan penjual menerima pesan galat mentah. Dengan gerbang di hook,
// tombol yang terlewat paling buruk cuma tidak terlihat terkunci — ia tetap
// tidak melakukan apa-apa yang berbahaya.
//
// Ini penting justru untuk kasus turun tier. Penjual yang baru berhenti
// bayar akan BENAR-BENAR menekan tombol yang kemarin masih jalan; ia tidak
// menebak-nebak seperti pengguna baru. Satu tombol yang bocor sama dengan
// satu toast 403 di muka orang yang sudah kecewa.
//
// Jadi pembagiannya tegas:
//   hook    → PENGAMAN. Permintaannya tidak pernah berangkat.
//   mahkota → TAMPILAN. Menjelaskan kenapa, bukan yang menahan.
//
// ── KENAPA MODAL, BUKAN TOAST ──────────────────────────────────────────────
//
// Versi sebelumnya memakai `toast.info`. Toast lewat begitu saja: ia
// memberitahu penjual bahwa tombolnya tidak jalan, lalu menghilang tanpa
// menawarkan apa pun — jalan keluarnya harus dia cari sendiri di halaman
// lain. Sekarang yang muncul modal upgrade, dengan tombolnya sekalian.
// Pola yang sama dengan Studio.
//
// Server tetap lapis terakhir: `KasirPlanGuard` menolak semua mutasi dari
// tenant FREE, apa pun yang terjadi di klien.
//
// ── KENAPA MENUNGGU `isLoading` ────────────────────────────────────────────
// `useSubscriptionPlan()` punya `placeholderData` dengan `tier: 'FREE'`.
// Artinya SELAMA query paket memuat, tier terbaca FREE. Mengunci berdasarkan
// itu berarti klik pertama penjual BERBAYAR ikut tertelan — persis di detik
// pertama halaman dibuka, saat orang paling sering menekan sesuatu.
// ============================================================================

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSubscriptionPlan } from './use-subscription-plan';
import { bukaUpgrade } from '@/stores/upgrade-modal-store';

export interface KasirLock {
  /** true = tenant FREE dan paketnya sudah pasti terbaca. */
  terkunci: boolean;
  /**
   * Membungkus penangan aksi. Saat terkunci, penangannya TIDAK dipanggil
   * dan penjual mendapat penjelasan; saat terbuka, ia diteruskan apa adanya.
   */
  jaga: <T extends unknown[]>(
    aksi: (...args: T) => void,
  ) => (...args: T) => void;
  /** Menjelaskan kenapa aksinya tidak jalan. Dipakai `jaga`, dan bisa dipanggil sendiri. */
  jelaskan: () => void;
}

export function useKasirLock(): KasirLock {
  const { tier, isLoading } = useSubscriptionPlan();
  const t = useTranslations('dashboard.kasir.terkunci');

  const terkunci = !isLoading && tier === 'FREE';

  const jelaskan = useCallback(() => {
    // Store, bukan state lokal: pemanggilnya tombol-tombol yang tersebar
    // sampai ke dalam sheet dan baris tabel. Modalnya dirender sekali di
    // shell dasbor (UpgradeModalHost).
    bukaUpgrade({ title: t('judul'), description: t('pesan') });
  }, [t]);

  const jaga = useCallback(
    <T extends unknown[]>(aksi: (...args: T) => void) =>
      (...args: T) => {
        if (terkunci) {
          jelaskan();
          return;
        }
        aksi(...args);
      },
    [terkunci, jelaskan],
  );

  return { terkunci, jaga, jelaskan };
}
