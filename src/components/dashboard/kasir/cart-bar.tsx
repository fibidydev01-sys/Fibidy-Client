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
//
// [UI/UX — Agu 2026] Dua hal yang diperbaiki:
//
// 1. Lebarnya tidak lagi dikunci `max-w-2xl` di dalam sini. Bar yang menentukan
//    lebarnya sendiri akan berhenti sejajar dengan daftar produk begitu
//    halamannya berubah lebar — dan itu persis yang terjadi. Sekarang ia
//    mengikuti induknya.
//
// 2. Jarak dari bawah memakai --kasir-bottom-inset, bukan `bottom-20 md:bottom-4`
//    yang ditebak dari tinggi MobileNavbar.
// ============================================================================

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <div className="pointer-events-none sticky bottom-[calc(var(--kasir-bottom-inset)+0.75rem)] z-30">
      <Button
        asChild
        size="lg"
        className="pointer-events-auto h-14 w-full justify-between gap-3 px-4 shadow-lg"
      >
        <Link href="/dashboard/kasir/keranjang">
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
            <ShoppingCart className="size-4" aria-hidden />
            <Badge
              variant="secondary"
              className="absolute -right-2 -top-2 h-5 min-w-5 px-1 text-[11px] font-bold tabular-nums"
            >
              {totalItem}
            </Badge>
          </span>

          <span className="flex-1 text-left text-sm font-semibold">
            {t('viewCart')}
          </span>

          <span className="text-base font-bold tabular-nums">
            {formatPriceIDR(total)}
          </span>
        </Link>
      </Button>
    </div>
  );
}
