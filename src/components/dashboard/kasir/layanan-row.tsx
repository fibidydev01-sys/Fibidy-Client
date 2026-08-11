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
//
// [UI/UX — Agu 2026] Ikut memakai KasirRowCard, jadi baris layanan dan baris
// barang benar-benar satu bentuk — bukan dua salinan yang kebetulan mirip.
// ============================================================================

import { useTranslations } from 'next-intl';
import { Clock, Plus } from 'lucide-react';
import { formatPriceIDR } from '@/lib/shared/format';
import { formatDurasiLayanan } from '@/lib/shared/product-utils';
import { KasirBadge } from './kasir-badges';
import { QtyStepper } from './qty-stepper';
import { KasirRowButton, KasirRowCard, KasirRowContent } from './kasir-row-card';
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
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Plus className="h-4 w-4" aria-hidden />
        </span>
      )}
    </>
  );

  if (adaDiKeranjang) {
    return (
      <KasirRowCard selected>
        <KasirRowContent>{isi}</KasirRowContent>
      </KasirRowCard>
    );
  }

  return (
    <KasirRowCard>
      <KasirRowButton
        onClick={onAdd}
        aria-label={t('addToCart', { nama: layanan.name })}
      >
        {isi}
      </KasirRowButton>
    </KasirRowCard>
  );
}
