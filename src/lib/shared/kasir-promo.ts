// ==========================================
// PROMO PREVIEW (FE)
// File: src/lib/shared/kasir-promo.ts
//
// Cerminan `applyPromo` di server (src/kasir/utils/promo-engine.ts).
//
// ⚠️ Ini HANYA untuk pratinjau di keranjang supaya kasir bisa bilang ke
// pelanggan "yang dua ini gratis" sebelum bayar. Baris gratis yang benar-benar
// tersimpan tetap dihitung ulang server saat transaksi dibuat — FE tidak
// pernah mengirim baris PROMO_FREE dan server pun akan mengabaikannya.
//
// Kalau aturan promo di server berubah, ubah juga di sini — dua-duanya
// mengikuti rumus yang sama: BOGO tiap kelipatan 2, Buy2Get1 tiap kelipatan 3.
// ==========================================

import type { CartFreeLine, CartLine, PromoRuleAktif, TipePromo } from '@/types/kasir';

export function qtyGratis(tipe: TipePromo, qty: number): number {
  if (qty <= 0) return 0;
  if (tipe === 'BOGO') return Math.floor(qty / 2);
  if (tipe === 'BUY2GET1') return Math.floor(qty / 3);
  return 0;
}

/** Baris gratis untuk ditampilkan di bawah item berbayar terkait. */
export function hitungBarisGratis(
  lines: CartLine[],
  rules: PromoRuleAktif[],
): CartFreeLine[] {
  if (rules.length === 0) return [];

  const hasil: CartFreeLine[] = [];
  for (const line of lines) {
    const rule = rules.find((r) => r.productId === line.productId && r.isActive);
    if (!rule) continue;

    const gratis = qtyGratis(rule.tipePromo, line.qty);
    if (gratis > 0) {
      hasil.push({
        productId: line.productId,
        namaProduk: line.namaProduk,
        qty: gratis,
      });
    }
  }
  return hasil;
}

/** Label pendek untuk badge promo di kartu produk. */
export function labelPromo(tipe: TipePromo): string {
  return tipe === 'BOGO' ? 'Beli 1 Gratis 1' : 'Beli 2 Gratis 1';
}
