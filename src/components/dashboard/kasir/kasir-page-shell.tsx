'use client';

// ============================================================================
// KASIR PAGE SHELL
// File: src/components/dashboard/kasir/kasir-page-shell.tsx
//
// Satu-satunya tempat lebar halaman kasir ditentukan.
//
// Sebelum ini tiap halaman menulis wrapper-nya sendiri: Papan memakai lebar
// penuh (sama seperti /dashboard/products), sementara Jual, Riwayat, Stok, dan
// Laporan mengunci diri di `mx-auto max-w-2xl`. Akibatnya berpindah tab
// menggeser judul dan strip tab secara horizontal — modul yang sama terasa
// seperti dua aplikasi berbeda.
//
// Shell ini juga membungkus SEMUA cabang state (loading, error, kosong, isi).
// Dulu tiap cabang punya wrapper sendiri (`space-y-6` untuk error, `gap-4`
// untuk sukses), jadi jarak judul→tab→konten berubah begitu data datang.
// Sekarang mustahil: cabangnya cuma mengganti `children`.
//
// Lebar tidak pernah ditulis ulang di halaman. Konten yang terlalu lebar untuk
// dibaca TIDAK dipersempit dengan max-w, melainkan dipecah jadi grid oleh
// halamannya masing-masing.
// ============================================================================

import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/shared/utils';
import { KasirTabs } from './kasir-tabs';

export interface KasirPageShellProps {
  title: string;
  subtitle?: string;
  /** Elemen sebelum judul — dipakai tombol kembali di halaman Keranjang. */
  leading?: React.ReactNode;
  /** Aksi di ujung kanan baris judul. */
  actions?: React.ReactNode;
  /** Baris pencarian/filter. Dirender di bawah header, di luar area scroll. */
  toolbar?: React.ReactNode;
  /**
   * Sub-nav kasir. Dimatikan pada layar yang merupakan ALUR, bukan tujuan —
   * satu-satunya jalan keluar dari Keranjang adalah selesai atau kembali.
   */
  showTabs?: boolean;
  /**
   * 'full'    → mengikuti lebar dashboard, sama persis dengan Papan & Products.
   * 'focused' → checkout: dibatasi supaya angka dan tombol bayar tetap satu
   *             blok pandangan. Ini SATU-SATUNYA pengecualian, dan ia tinggal
   *             di sini, bukan sebagai `max-w-2xl` yang diketik ulang.
   */
  width?: 'full' | 'focused';
  className?: string;
  children: React.ReactNode;
}

export function KasirPageShell({
  title,
  subtitle,
  leading,
  actions,
  toolbar,
  showTabs = true,
  width = 'full',
  className,
  children,
}: KasirPageShellProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-4',
        width === 'focused' && 'mx-auto max-w-5xl',
        className,
      )}
    >
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2">
            {leading}
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>

        {showTabs && <KasirTabs />}

        <Separator />
      </header>

      {toolbar}

      {children}
    </div>
  );
}
