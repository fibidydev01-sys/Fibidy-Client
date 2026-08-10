'use client';

// ============================================================================
// BADGE KASIR — satu komponen untuk semua status di modul kasir
// File: src/components/dashboard/kasir/kasir-badges.tsx
//
// Aturan warna dipakai konsisten di seluruh aplikasi:
//   merah  = butuh tindakan (HABIS, VOID)
//   kuning = peringatan     (SISA N)
//   biru   = informasi      (REFUND, GRATIS)
//   hijau  = aman           (SELESAI)
//
// Semua status kasir WAJIB lewat komponen ini — kalau tiap halaman
// menggambar badge sendiri, "HABIS" akan tampil merah di satu layar dan
// abu-abu di layar lain.
// ============================================================================

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/shared/utils';
import type { KasirTransaksiStatus } from '@/types/kasir';

const BASE =
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap';

const TONE = {
  danger:
    'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-red-300',
  warning:
    'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  success:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  muted: 'bg-muted text-muted-foreground',
} as const;

type Tone = keyof typeof TONE;

export function KasirBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn(BASE, TONE[tone], className)}>{children}</span>;
}

// ── Badge stok ──────────────────────────────────────────────────────────────
//
// Sinyal visual saja, BUKAN pemblokir. Produk stok 0 tetap boleh dijual —
// stok sistem sering telat dari kondisi rak, dan menolak penjualan karena
// angka yang belum di-opname adalah kerugian nyata buat UMKM.

export function StokBadge({
  stok,
  minStock,
  className,
}: {
  stok: number;
  minStock: number;
  className?: string;
}) {
  const t = useTranslations('dashboard.kasir.badge');

  if (stok <= 0) {
    return (
      <KasirBadge tone="danger" className={className}>
        {t('habis')}
      </KasirBadge>
    );
  }

  if (stok <= minStock) {
    return (
      <KasirBadge tone="warning" className={className}>
        {t('sisa', { jumlah: stok })}
      </KasirBadge>
    );
  }

  return null;
}

// ── Badge status transaksi ──────────────────────────────────────────────────

export function StatusTransaksiBadge({
  status,
  className,
}: {
  status: KasirTransaksiStatus;
  className?: string;
}) {
  const t = useTranslations('dashboard.kasir.status');

  const tone: Tone =
    status === 'VOID' ? 'danger' : status === 'REFUND' ? 'info' : 'success';

  return (
    <KasirBadge tone={tone} className={className}>
      {t(status.toLowerCase())}
    </KasirBadge>
  );
}

// ── Badge item gratis dari promo ────────────────────────────────────────────

export function GratisBadge({ className }: { className?: string }) {
  const t = useTranslations('dashboard.kasir.badge');
  return (
    <KasirBadge tone="info" className={className}>
      {t('gratis')}
    </KasirBadge>
  );
}
