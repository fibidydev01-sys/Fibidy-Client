'use client';

// ============================================================================
// PRODUCT ROW — baris produk di tab Kasir
// File: src/components/dashboard/kasir/product-row.tsx
//
// Satu kolom, satu baris per produk — bukan grid. Nama dan harga harus
// terbaca sekali lirik tanpa perlu fokus, dan target tapnya selebar layar.
//
// Dua keadaan baris:
//   - Belum di keranjang → SELURUH baris adalah tombol tambah (satu tap).
//   - Sudah di keranjang → baris berubah jadi stepper, dan baris itu sendiri
//     TIDAK bisa ditap lagi. Tanpa aturan kedua ini, kasir yang menekan area
//     kosong baris akan menambah qty tanpa sadar.
// ============================================================================

import { useTranslations } from 'next-intl';
import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { formatPriceIDR } from '@/lib/shared/format';
import { StokBadge, KasirBadge } from './kasir-badges';
import { QtyStepper } from './qty-stepper';
import type { KasirProduct, TipePromo } from '@/types/kasir';
import { labelPromo } from '@/lib/shared/kasir-promo';

export function ProductRow({
  product,
  qtyDiKeranjang,
  promo,
  onAdd,
  onIncrement,
  onDecrement,
}: {
  product: KasirProduct;
  qtyDiKeranjang: number;
  promo?: TipePromo;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const t = useTranslations('dashboard.kasir.product');
  const adaDiKeranjang = qtyDiKeranjang > 0;

  const isi = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate font-medium">{product.name}</span>
          <StokBadge stok={product.stok} minStock={product.minStock} />
          {promo && <KasirBadge tone="info">{labelPromo(promo)}</KasirBadge>}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="tabular-nums">{formatPriceIDR(product.price)}</span>
          {product.category && (
            <>
              <span aria-hidden>·</span>
              <span className="truncate">{product.category}</span>
            </>
          )}
        </div>
      </div>

      {adaDiKeranjang ? (
        <QtyStepper
          qty={qtyDiKeranjang}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Plus className="h-4 w-4" aria-hidden />
        </span>
      )}
    </>
  );

  if (adaDiKeranjang) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors',
          'border-primary/40 bg-primary/[0.04]',
        )}
      >
        <span className="sr-only">
          <Check aria-hidden /> {t('inCart', { qty: qtyDiKeranjang })}
        </span>
        {isi}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label={t('addToCart', { nama: product.name })}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
        'hover:border-primary/40 hover:bg-muted/50 active:scale-[0.995]',
      )}
    >
      {isi}
    </button>
  );
}

export function ProductRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border px-3 py-3">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-2/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
