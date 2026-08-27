// ============================================================================
// KASIR SCREENS — satu daftar layar kasir, dipakai tab DAN sidebar
// File: src/lib/constants/dashboard/kasir-screens.ts
//
// ── CACAT YANG DIPERBAIKI ──────────────────────────────────────────────────
//
// Daftar layar kasir ditulis DUA KALI dengan aturan yang berbeda:
//
//   kasir-tabs.tsx        5 layar, DISARING oleh dagangType
//   dashboard-sidebar.tsx 5 layar, TANPA saringan (`subKeys`)
//
// Untuk toko PRODUK, hasilnya terlihat langsung di layar: sidebar menampilkan
// "Papan Kerja", strip tab tidak. Satu modul, dua daftar navigasi, dua
// jawaban berbeda untuk pertanyaan yang sama.
//
// Dan yang benar adalah TAB-nya. Papan Kerja bukan sekadar "kurang relevan"
// untuk toko PRODUK — ia DIJAMIN KOSONG SELAMANYA. Servernya menyaring keras:
//
//   umkm-server src/kasir/papan/kasir-papan.service.ts
//     where: { itemKind: 'JASA', ... }
//
// Toko yang tidak menjual layanan tidak akan pernah punya satu kartu pun di
// papan. Tautan sidebar-nya bukan cuma tidak konsisten — ia mengantar penjual
// ke layar yang mustahil terisi, dan layar kosong yang permanen membuat orang
// mengira datanya hilang. Aturan yang sama sudah ditulis untuk tab Stok pada
// toko JASA; ia cuma tidak pernah sampai ke sidebar.
//
// Jadi daftarnya dipindah ke sini, dan KEDUA pemakainya menyaring dengan
// fungsi yang sama. Divergensi berikutnya jadi mustahil, bukan cuma
// diperbaiki sekali.
// ============================================================================

import {
  BarChart3,
  Boxes,
  ClipboardList,
  History,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';

import type { KasirDagangType } from '@/types/kasir';

export interface KasirScreen {
  href: string;
  /** Kunci i18n, relatif terhadap `dashboard.kasir.tabs`. */
  key: string;
  icon: LucideIcon;
  /** true = hanya aktif pada path persis, bukan prefix. */
  exact?: boolean;
  /**
   * Mode dagang yang boleh melihat layar ini. Tidak diisi = selalu tampil.
   *
   * Menyembunyikan, bukan mengosongkan: layar yang servernya jamin kosong
   * untuk mode dagang tertentu tidak boleh punya pintu masuk.
   */
  untuk?: KasirDagangType[];
}

export const KASIR_SCREENS: KasirScreen[] = [
  {
    href: '/dashboard/kasir',
    key: 'jual',
    icon: ShoppingCart,
    exact: true,
  },
  {
    href: '/dashboard/kasir/papan',
    key: 'papan',
    icon: ClipboardList,
    // Server: `where: { itemKind: 'JASA' }`. Toko PRODUK murni tidak akan
    // pernah punya kartu di sini.
    untuk: ['JASA', 'HYBRID'],
  },
  {
    href: '/dashboard/kasir/riwayat',
    key: 'riwayat',
    icon: History,
  },
  {
    href: '/dashboard/kasir/stok',
    key: 'stok',
    icon: Boxes,
    // Layanan tidak punya persediaan.
    untuk: ['PRODUK', 'HYBRID'],
  },
  {
    href: '/dashboard/kasir/laporan',
    key: 'laporan',
    icon: BarChart3,
  },
];

/**
 * Layar yang boleh dilihat sebuah toko.
 *
 * `null` (mode dagang belum diketahui) diperlakukan sebagai 'PRODUK' — sama
 * dengan tebakan lama kasir-tabs, dan itu tebakan yang benar: mayoritas toko
 * UMKM menjual barang.
 */
export function layarKasirUntuk(
  dagangType: KasirDagangType | null | undefined,
): KasirScreen[] {
  const mode = dagangType ?? 'PRODUK';
  return KASIR_SCREENS.filter((s) => !s.untuk || s.untuk.includes(mode));
}

// ─── Ingatan mode dagang ────────────────────────────────────────────────────
//
// Mode dagang datang dari `useKasirConfig()`, dan strip tab sudah
// menyimpannya di localStorage sebagai tebakan awal supaya kunjungan kedua
// tidak berkedip 4 tab → 5 tab.
//
// Sidebar membaca cache yang SAMA alih-alih ikut memanggil `useKasirConfig()`
// sendiri. Alasannya: sidebar dirender di SETIAP halaman dasbor, termasuk
// milik penjual yang tidak pernah membuka Kasir dan penjual EDU yang
// endpoint-nya menjawab 403. Menambah satu request per sesi ke seluruh
// dasbor demi menyaring satu entri submenu adalah harga yang salah.
//
// Konsekuensinya jujur: sebelum Kasir pernah dibuka sekali, sidebar
// menampilkan seluruh layar — persis perilaku hari ini. Setelah itu ia benar.

export const KASIR_DAGANG_CACHE_KEY = 'fibidy.kasir.dagangType';

export function bacaCacheDagangType(): KasirDagangType | null {
  try {
    const nilai = window.localStorage.getItem(KASIR_DAGANG_CACHE_KEY);
    return nilai === 'PRODUK' || nilai === 'JASA' || nilai === 'HYBRID'
      ? nilai
      : null;
  } catch {
    // Safari mode privat melempar saat localStorage disentuh. Tebakan awal
    // hilang, daftarnya tetap benar setelah config datang.
    return null;
  }
}

export function tulisCacheDagangType(nilai: KasirDagangType): void {
  try {
    window.localStorage.setItem(KASIR_DAGANG_CACHE_KEY, nilai);
  } catch {
    /* tanpa cache pun daftarnya tetap benar */
  }
}
