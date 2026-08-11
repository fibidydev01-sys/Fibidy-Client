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
//
// [UI/UX — Agu 2026] Memakai <Tabs> milik design system, bukan grid tombol
// dengan `bg-background shadow-sm` buatan tangan. Tabs adalah komponen yang
// tepat justru karena ia benar-benar MENUKAR ISI layar — beda dari filter
// kategori di bawahnya yang hanya menyaring satu daftar (itu ToggleGroup).
// ============================================================================

import { useTranslations } from 'next-intl';
import { Package, Wrench } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as KatalogMode)}
      className={cn('w-full', className)}
    >
      <TabsList aria-label={t('ariaLabel')} className="grid w-full grid-cols-2">
        <TabsTrigger value="PRODUK">
          <Package className="h-4 w-4" aria-hidden />
          {t('produk')}
        </TabsTrigger>
        <TabsTrigger value="JASA">
          <Wrench className="h-4 w-4" aria-hidden />
          {t('layanan')}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
