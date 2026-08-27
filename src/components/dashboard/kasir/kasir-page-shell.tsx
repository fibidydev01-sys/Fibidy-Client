'use client';

// ============================================================================
// KASIR PAGE SHELL
// File: src/components/dashboard/kasir/kasir-page-shell.tsx
//
// Satu-satunya tempat lebar halaman kasir ditentukan: SELALU lebar penuh,
// sama persis dengan Papan & Products. Tidak ada pengecualian.
//
// Shell ini membungkus SEMUA cabang state (loading, error, kosong, isi).
// Dulu tiap cabang punya wrapper sendiri (`space-y-6` untuk error, `gap-4`
// untuk sukses), jadi jarak judul→tab→konten berubah begitu data datang.
// Sekarang mustahil: cabangnya cuma mengganti `children`.
//
// Konten yang terlalu lebar untuk dibaca TIDAK dipersempit dengan max-w,
// melainkan dipecah jadi grid oleh halamannya masing-masing.
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
  className,
  children,
}: KasirPageShellProps) {
  return (
    <div
      className={cn(
        // `h-full` bukan hiasan: ia yang membuat area isi di bawah bisa
        // memakai `flex-1`, dan itu yang membuat CartBar mendarat di TEPI
        // BAWAH panel meski katalognya cuma dua produk.
        //
        // Sebelumnya bilah itu `sticky bottom-…` tanpa apa pun yang
        // mendorongnya turun, jadi pada halaman pendek ia menggantung tepat
        // di bawah produk terakhir — di tengah layar, dengan ruang kosong
        // sepanjang layar di bawahnya. `sticky` baru menempel kalau ada yang
        // digulir; ia tidak pernah bisa menggantikan "dorong ke bawah".
        //
        // Pola yang sama sudah dipakai WizardNav sejak awal, dan itu memang
        // acuan yang diminta: bilah aksi kasir dan bilah langkah wizard
        // sekarang mendarat di garis yang sama.
        'flex h-full w-full flex-col gap-4',
        className,
      )}
    >
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2">
            {leading}
            <div className="min-w-0">
              <h1 className="truncate text-display-sm text-ink">
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

      {/* `min-h-0` wajib di anak flex yang boleh menyusut — tanpa itu ia
          memakai `min-height: auto` dan menolak lebih pendek dari isinya. */}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}