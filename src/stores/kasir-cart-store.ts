'use client';

// ============================================================================
// KASIR CART STORE
// File: src/stores/kasir-cart-store.ts
//
// Keranjang kasir hidup di store, bukan di state halaman, karena dipakai dua
// layar: tab Kasir (pilih produk) dan halaman Keranjang (checkout). Tombol
// kembali dari Keranjang harus meninggalkan isi keranjang tetap utuh.
//
// Di-persist ke sessionStorage: refresh tidak menghapus keranjang yang sedang
// dilayani, tapi keranjang juga tidak ikut hidup di tab lain atau besok pagi —
// transaksi yang belum dibayar memang tidak seharusnya bertahan selama itu.
//
// Yang TIDAK disimpan di sini: perhitungan promo dan total final. Keduanya
// dihitung server saat transaksi dibuat. Angka di layar hanya pratinjau.
// ============================================================================

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  CartLine,
  KasirLayanan,
  KasirPaymentMethod,
  KasirProduct,
} from '@/types/kasir';

interface DiskonTerpilih {
  id: string;
  nama: string;
  persen: number;
}

interface KasirCartState {
  lines: CartLine[];
  diskon: DiskonTerpilih | null;
  paymentMethod: KasirPaymentMethod;
  /** String, bukan number: input kosong ≠ nol, dan "0" ≠ belum diisi. */
  uangDiterima: string;
  /**
   * [JASA] Petugas pengerjaan untuk pesanan ini. Satu isian untuk seluruh
   * pesanan, walau kolomnya per-item di database: mengetik nama per baris
   * terlalu lambat saat ada antrean. Kalau kelak satu pesanan perlu dibagi
   * ke dua petugas, datanya sudah siap — tinggal UI-nya yang menyusul.
   */
  picNama: string;
}

interface KasirCartActions {
  addProduct: (product: KasirProduct) => void;
  /** [JASA] Layanan masuk keranjang yang SAMA dengan barang — satu pesanan. */
  addLayanan: (layanan: KasirLayanan) => void;
  increment: (productId: string) => void;
  /** Turunkan qty. Pada qty 1 baris DIHAPUS — tombol berubah jadi ikon hapus. */
  decrement: (productId: string) => void;
  removeLine: (productId: string) => void;
  clear: () => void;
  setDiskon: (diskon: DiskonTerpilih | null) => void;
  setPaymentMethod: (method: KasirPaymentMethod) => void;
  setUangDiterima: (nilai: string) => void;
  setPicNama: (nama: string) => void;
}

const INITIAL: KasirCartState = {
  lines: [],
  diskon: null,
  paymentMethod: 'TUNAI',
  uangDiterima: '',
  picNama: '',
};

export const useKasirCartStore = create<KasirCartState & KasirCartActions>()(
  persist(
    (set) => ({
      ...INITIAL,

      addProduct: (product) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === product.id);

          // Produk yang sudah ada NAIK qty-nya, tidak membuat baris kedua.
          // Baris duplikat akan membuat promo dihitung per baris (2+2 tidak
          // dapat gratis padahal 4 dapat 2) dan membingungkan saat dihapus.
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === product.id ? { ...l, qty: l.qty + 1 } : l,
              ),
            };
          }

          return {
            lines: [
              ...state.lines,
              {
                productId: product.id,
                namaProduk: product.name,
                hargaSatuan: product.price,
                qty: 1,
                kind: 'PRODUK',
                stok: product.stok,
                minStock: product.minStock,
              },
            ],
          };
        }),

      addLayanan: (layanan) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === layanan.id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === layanan.id ? { ...l, qty: l.qty + 1 } : l,
              ),
            };
          }

          return {
            lines: [
              ...state.lines,
              {
                productId: layanan.id,
                namaProduk: layanan.name,
                hargaSatuan: layanan.price,
                qty: 1,
                kind: 'JASA',
                // Layanan tidak punya stok — nol di sini berarti "tidak
                // berlaku", dan komponen badge tidak pernah dipanggil untuk
                // baris jasa. Lihat CartLine di types/kasir.ts.
                stok: 0,
                minStock: 0,
                durasiLabel: layanan.durasiLabel,
              },
            ],
          };
        }),

      increment: (productId) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.productId === productId ? { ...l, qty: l.qty + 1 } : l,
          ),
        })),

      decrement: (productId) =>
        set((state) => ({
          lines: state.lines.flatMap((l) => {
            if (l.productId !== productId) return [l];
            if (l.qty <= 1) return [];
            return [{ ...l, qty: l.qty - 1 }];
          }),
        })),

      removeLine: (productId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.productId !== productId),
        })),

      // Kosongkan mereset diskon dan uang tunai juga — kalau hanya item yang
      // dibuang, diskon 20% dari pelanggan sebelumnya diam-diam ikut ke
      // transaksi berikutnya.
      clear: () => set({ ...INITIAL }),

      setDiskon: (diskon) => set({ diskon }),
      setPicNama: (picNama) => set({ picNama }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setUangDiterima: (uangDiterima) => set({ uangDiterima }),
    }),
    {
      name: 'fibidy-kasir-cart',
      // SSR tidak punya sessionStorage. Kembalikan penyimpanan kosong
      // alih-alih membiarkan zustand menyentuh window — kalau tidak,
      // render di server melempar sebelum halaman sempat tampil.
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          };
        }
        return window.sessionStorage;
      }),
      // Keranjang yang tersimpan SEBELUM fitur jasa tidak punya `kind`.
      // Tanpa migrasi, baris lama itu akan lolos sebagai `undefined` dan
      // diperlakukan sebagai barang secara kebetulan, bukan secara sengaja.
      version: 1,
      migrate: (persisted, versiLama) => {
        const state = persisted as Partial<KasirCartState>;
        if (versiLama < 1) {
          return {
            ...state,
            picNama: '',
            lines: (state.lines ?? []).map((l) => ({
              ...l,
              kind: l.kind ?? ('PRODUK' as const),
            })),
          };
        }
        return state;
      },
      partialize: (state) => ({
        lines: state.lines,
        diskon: state.diskon,
        paymentMethod: state.paymentMethod,
        uangDiterima: state.uangDiterima,
        picNama: state.picNama,
      }),
    },
  ),
);

// ── Selector turunan ────────────────────────────────────────────────────────

export function hitungSubtotal(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.hargaSatuan * l.qty, 0);
}

export function hitungTotalItem(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.qty, 0);
}

/**
 * Pratinjau total di layar. Rumusnya disamakan persis dengan
 * `hitungGrandTotal` di server (pembulatan diskon memakai Math.round) supaya
 * angka di keranjang tidak pernah berbeda dari angka di struk.
 */
export function hitungTotal(lines: CartLine[], diskonPersen: number) {
  const subtotal = hitungSubtotal(lines);
  const persen = Math.max(0, Math.min(diskonPersen || 0, 100));
  const diskonNominal = Math.round((subtotal * persen) / 100);
  const grandTotal = Math.max(0, subtotal - diskonNominal);
  return { subtotal, diskonNominal, grandTotal };
}
