'use client';

// ============================================================================
// KATALOG TOGGLE — Produk ↔ Layanan
// File: src/components/dashboard/kasir/katalog-toggle.tsx
//
// Hanya muncul untuk toko HYBRID. Toko yang cuma jual barang melihat grid
// produk persis seperti sebelum fitur jasa ada; toko jasa murni melihat daftar
// layanan saja. Toggle yang salah satu sisinya selalu kosong lebih merugikan
// daripada toggle yang tidak ada.
//
// Ini toggle DI DALAM satu halaman, bukan dua route: keranjang bisa berisi
// campuran barang dan layanan dalam satu pesanan, dan state itu jauh lebih
// sederhana kalau keduanya hidup di komponen yang sama.
// ============================================================================

import { useTranslations } from 'next-intl';
import { Package, Wrench } from 'lucide-react';
import { cn } from '@/lib/shared/utils';

export type KatalogMode = 'PRODUK' | 'JASA';

export function KatalogToggle({
  value,
  onChange,
  className,
}: {
  value: KatalogMode;
  onChange: (mode: KatalogMode) => void;
  className?: string;
}) {
  const t = useTranslations('dashboard.kasir.katalog');

  const opsi = [
    { id: 'PRODUK' as const, label: t('produk'), icon: Package },
    { id: 'JASA' as const, label: t('layanan'), icon: Wrench },
  ];

  return (
    <div
      className={cn('grid grid-cols-2 gap-1 rounded-xl bg-muted p-1', className)}
      role="group"
      aria-label={t('ariaLabel')}
    >
      {opsi.map((o) => {
        const aktif = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={aktif}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              aktif
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <o.icon className="h-4 w-4" aria-hidden />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
