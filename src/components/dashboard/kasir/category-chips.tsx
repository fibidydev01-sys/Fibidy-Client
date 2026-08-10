'use client';

// ============================================================================
// CATEGORY CHIPS
// File: src/components/dashboard/kasir/category-chips.tsx
//
// Filter kategori berupa chip horizontal, bukan dropdown: pilihan langsung
// terlihat dan cukup satu tap. Dropdown butuh dua tap dan menutup daftar
// produk saat terbuka — dua-duanya mahal saat pelanggan menunggu.
//
// Chip "Semua" selalu ada di depan sebagai jalan pulang dari filter apa pun.
// ============================================================================

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/shared/utils';

export function CategoryChips({
  categories,
  value,
  onChange,
  className,
}: {
  categories: string[];
  /** null = semua kategori */
  value: string | null;
  onChange: (kategori: string | null) => void;
  className?: string;
}) {
  const t = useTranslations('dashboard.kasir.filter');

  // Tanpa kategori sama sekali, chip "Semua" sendirian tidak memfilter apa pun.
  if (categories.length === 0) return null;

  const chip = (aktif: boolean) =>
    cn(
      'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
      aktif
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
    );

  return (
    <div
      className={cn('-mx-1 flex gap-2 overflow-x-auto px-1 pb-1', className)}
      role="group"
      aria-label={t('categoryLabel')}
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        className={chip(value === null)}
        aria-pressed={value === null}
      >
        {t('all')}
      </button>

      {categories.map((kategori) => (
        <button
          key={kategori}
          type="button"
          onClick={() => onChange(kategori)}
          className={chip(value === kategori)}
          aria-pressed={value === kategori}
        >
          {kategori}
        </button>
      ))}
    </div>
  );
}
