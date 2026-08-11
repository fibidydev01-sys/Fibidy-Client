'use client';

// ============================================================================
// BADGE KASIR — satu komponen untuk semua status di modul kasir
// File: src/components/dashboard/kasir/kasir-badges.tsx
//
// Aturan warna dipakai konsisten di seluruh aplikasi:
//   merah  = butuh tindakan (HABIS, VOID)
//   kuning = peringatan     (SISA N, BELUM BAYAR)
//   biru   = informasi      (REFUND, GRATIS)
//   hijau  = aman           (SELESAI)
//
// Semua status kasir WAJIB lewat komponen ini — kalau tiap halaman
// menggambar badge sendiri, "HABIS" akan tampil merah di satu layar dan
// abu-abu di layar lain.
//
// [UI/UX — Agu 2026] Dibangun di atas <Badge> milik design system, bukan
// `span` dengan kelas sendiri. Sebelumnya ada dua sistem badge yang berjalan
// paralel (BASE+TONE di sini, badgeVariants di ui/badge) plus badge ketiga
// yang ditulis langsung di JSX halaman Papan. Sekarang radius, tinggi baris,
// ukuran ikon, dan cincin fokusnya datang dari satu tempat; berkas ini tinggal
// memetakan MAKNA (tone) ke warna.
// ============================================================================

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/shared/utils';
import type { KasirTransaksiStatus } from '@/types/kasir';

const TONE = {
  danger:
    'border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-red-300',
  warning:
    'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  info: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  success:
    'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  muted: 'border-transparent bg-muted text-muted-foreground',
} as const;

export type KasirTone = keyof typeof TONE;

export function KasirBadge({
  tone,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Badge> & { tone: KasirTone }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'px-2 py-0.5 text-[11px] font-semibold leading-none',
        TONE[tone],
        className,
      )}
      {...props}
    >
      {children}
    </Badge>
  );
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

  // BELUM_BAYAR = kuning: butuh perhatian tapi bukan masalah — ada uang yang
  // masih harus ditagih. Beda dari VOID (merah, sesuatu dibatalkan).
  const tone: KasirTone =
    status === 'VOID'
      ? 'danger'
      : status === 'REFUND'
        ? 'info'
        : status === 'BELUM_BAYAR'
          ? 'warning'
          : 'success';

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
