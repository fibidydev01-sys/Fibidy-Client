'use client';

// ============================================================================
// CART BAR — floating action bar
// File: src/components/dashboard/kasir/cart-bar.tsx
//
// Bar melayang selebar konten, bukan FAB bulat: lebih mudah ditekan dan
// teksnya menjelaskan aksinya secara eksplisit ("Lihat Keranjang" + total),
// jadi kasir tahu jumlah yang akan ditagih sebelum berpindah layar.
//
// Ini SATU-SATUNYA pintu masuk ke halaman Keranjang. Tidak ada jalur lain —
// supaya "sedang melayani transaksi" selalu punya satu arah maju yang sama.
//
// Muncul hanya kalau keranjang berisi. Saat kosong, tab Kasir bersih.
// ============================================================================

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ShoppingCart } from 'lucide-react';
import { formatPriceIDR } from '@/lib/shared/format';

export function CartBar({
  totalItem,
  total,
}: {
  totalItem: number;
  total: number;
}) {
  const t = useTranslations('dashboard.kasir.cart');

  if (totalItem <= 0) return null;

  return (
    // bottom-20 di mobile memberi ruang untuk MobileNavbar (h-16) supaya bar
    // ini tidak menutupi tab bar; di md ke atas navbar itu tidak ada.
    <div className="pointer-events-none sticky bottom-20 z-30 md:bottom-4">
      <div className="mx-auto max-w-2xl px-1">
        <Link
          href="/dashboard/kasir/keranjang"
          className="pointer-events-auto flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-lg transition-transform active:scale-[0.99]"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
            <ShoppingCart className="h-4.5 w-4.5" aria-hidden />
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1 text-[11px] font-bold tabular-nums text-primary">
              {totalItem}
            </span>
          </span>

          <span className="flex-1 text-left text-sm font-semibold">
            {t('viewCart')}
          </span>

          <span className="text-base font-bold tabular-nums">
            {formatPriceIDR(total)}
          </span>
        </Link>
      </div>
    </div>
  );
}
