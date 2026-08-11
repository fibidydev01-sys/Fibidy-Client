'use client';

// ============================================================================
// LAYANAN ROW — baris layanan di tab Jual
// File: src/components/dashboard/kasir/layanan-row.tsx
//
// Kembarannya ProductRow, dengan dua beda yang disengaja:
//   1. TIDAK ada badge stok. Layanan tidak punya persediaan, dan badge "HABIS"
//      di sini akan berbohong.
//   2. Ada durasi. Itu informasi pertama yang ditanyakan pelanggan ("jadi
//      kapan?"), jadi ia menggantikan tempat yang di baris barang dipakai stok.
//
// Perilaku tap-nya sama persis: satu tap menambah, baris yang sudah di
// keranjang berubah jadi stepper dan tidak bisa ditap lagi.
// ============================================================================

import { useTranslations } from 'next-intl';
import { Clock, Plus } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { formatPriceIDR } from '@/lib/shared/format';
import { formatDurasiLayanan } from '@/lib/shared/product-utils';
import { KasirBadge } from './kasir-badges';
import { QtyStepper } from './qty-stepper';
import { labelPromo } from '@/lib/shared/kasir-promo';
import type { KasirLayanan, TipePromo } from '@/types/kasir';

export function LayananRow({
  layanan,
  qtyDiKeranjang,
  promo,
  onAdd,
  onIncrement,
  onDecrement,
}: {
  layanan: KasirLayanan;
  qtyDiKeranjang: number;
  promo?: TipePromo;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const t = useTranslations('dashboard.kasir.layanan');
  const adaDiKeranjang = qtyDiKeranjang > 0;

  const durasi = formatDurasiLayanan(layanan.durasiJam);

  const isi = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate font-medium">{layanan.name}</span>
          {layanan.durasiLabel && (
            <KasirBadge tone="muted">{layanan.durasiLabel}</KasirBadge>
          )}
          {promo && <KasirBadge tone="info">{labelPromo(promo)}</KasirBadge>}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="tabular-nums">{formatPriceIDR(layanan.price)}</span>
          {durasi && (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden />
                {t(durasi.satuan === 'hari' ? 'estimasiHari' : 'estimasiJam', {
                  nilai: durasi.nilai,
                })}
              </span>
            </>
          )}
          {layanan.category && (
            <>
              <span aria-hidden>·</span>
              <span className="truncate">{layanan.category}</span>
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
      <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/[0.04] px-3 py-3">
        {isi}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label={t('addToCart', { nama: layanan.name })}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
        'hover:border-primary/40 hover:bg-muted/50 active:scale-[0.995]',
      )}
    >
      {isi}
    </button>
  );
}
