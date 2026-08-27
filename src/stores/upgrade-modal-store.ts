'use client';

// ============================================================================
// UPGRADE MODAL STORE — satu modal untuk seluruh dasbor
// File: src/stores/upgrade-modal-store.ts
//
// ── KENAPA STORE, BUKAN STATE PER HALAMAN ──────────────────────────────────
//
// Ajakan upgrade dipicu dari tempat-tempat yang tersebar jauh: tombol di
// dalam sheet kasir, baris di tabel stok, tombol di kartu papan, catatan di
// form produk. Menaruh `useState` di setiap halaman berarti setiap halaman
// harus mengoper `onUpgrade` turun berlapis-lapis sampai ke tombol yang
// paling dalam — dan setiap lapis adalah tempat baru untuk lupa.
//
// Dengan store, pemicunya cukup memanggil `bukaUpgrade()` dari mana pun. Satu
// `<UpgradeModalHost />` di shell dasbor yang merendernya.
//
// ── KENAPA MODAL, BUKAN TOAST ──────────────────────────────────────────────
//
// Versi sebelumnya memakai `toast.info`. Toast lewat begitu saja: ia
// memberitahu penjual bahwa tombolnya tidak jalan, lalu menghilang tanpa
// menawarkan apa pun. Modal berhenti di depan orangnya dan membawa
// tombol upgrade — jalan keluarnya ADA di tempat masalahnya muncul, bukan
// di halaman lain yang harus dia cari sendiri.
//
// Ini pola yang sama dengan Studio: bloknya tidak disembunyikan, tombolnya
// tidak dimatikan, dan saat ditekan muncul modal yang menjelaskan sekaligus
// menawarkan jalan keluar.
// ============================================================================

import { create } from 'zustand';

interface UpgradeModalState {
  open: boolean;
  /** Judul modal. Kosong berarti pakai judul bawaan. */
  title?: string;
  /** Penjelasan. Kosong berarti pakai penjelasan bawaan. */
  description?: string;
  buka: (opts?: { title?: string; description?: string }) => void;
  tutup: () => void;
}

export const useUpgradeModalStore = create<UpgradeModalState>((set) => ({
  open: false,
  title: undefined,
  description: undefined,
  buka: (opts) =>
    set({ open: true, title: opts?.title, description: opts?.description }),
  tutup: () => set({ open: false }),
}));

/**
 * Pembuka modal upgrade dari mana pun.
 *
 * Sengaja BUKAN hook: ia dipanggil di dalam penangan klik, kadang jauh di
 * dalam callback yang bukan komponen. `getState()` membuatnya bisa dipanggil
 * dari sana tanpa melanggar aturan hook.
 */
export function bukaUpgrade(opts?: { title?: string; description?: string }) {
  useUpgradeModalStore.getState().buka(opts);
}
