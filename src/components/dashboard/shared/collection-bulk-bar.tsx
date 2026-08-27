'use client';

// ============================================================================
// COLLECTION BULK BAR — bilah aksi massal yang MENGAMBANG
// File: src/components/dashboard/shared/collection-bulk-bar.tsx
//
// ── APA YANG BERUBAH DARI VERSI SEBELUMNYA ─────────────────────────────────
//
// Bilah ini dulu sebuah <div> statis di ATAS grid produk:
//
//   <div className="mb-3 flex … rounded-[var(--shape-panel)] border
//                   bg-surface-sunken px-4 py-2.5">
//
// Tiga akibat yang semuanya terasa saat koleksinya panjang:
//
//   1. Ia MENDORONG isi. Mencentang satu produk menyisipkan bilah setinggi
//      ~46px di atas grid, jadi seluruh koleksi melompat turun — tepat saat
//      penjual sedang membidik kotak centang berikutnya.
//   2. Ia menggulir pergi. Penjual yang mencentang di baris 40 harus menggulir
//      balik ke atas untuk menemukan tombol Hapusnya.
//   3. Ia tidak terbaca sebagai lapisan. `bg-surface-sunken` adalah permukaan
//      CEKUNG — nada untuk kepala tabel dan bilah kaki kartu, benda yang
//      duduk DI DALAM kartu. Bilah aksi justru kebalikannya.
//
// Sekarang ia `fixed` di tengah bawah panel, mengambang di atas isi dengan
// bayangan dan latar buram — bentuk yang sama dengan bilah aksi massal EAS.
//
// ── BENTUK & LENGKUNGAN ────────────────────────────────────────────────────
//
// Lengkungannya `--shape-panel` (16px di dialek dasbor = {rounded.xl}),
// BUKAN angka `rounded-xl` yang ditulis tangan. Nilainya kebetulan sama
// hari ini; bedanya, token ikut berubah kalau dialeknya digeser, sementara
// angka tulis-tangan diam dan pelan-pelan jadi satu-satunya sudut di dasbor
// yang lengkungannya beda sendiri.
//
// Kontrol di dalamnya memakai `--shape-control` lewat Button biasa — pil di
// dialek dasbor. Tidak ada satu pun radius yang ditulis sebagai angka di
// berkas ini.
//
// ── KENAPA `fixed`, BUKAN `sticky` ─────────────────────────────────────────
//
// `sticky bottom-4` akan menempel pada wadah gulirnya. Grid produk tidak
// punya wadah gulir sendiri — yang menggulir halaman — jadi `sticky` di sana
// berperilaku persis seperti elemen biasa sampai halamannya cukup panjang,
// yang berarti perilakunya berbeda antara koleksi 8 produk dan 80.
//
// `bottom-24 md:bottom-6` bukan angka sembarang: di bawah `md`, MobileNavbar
// setinggi 64px menempel di tepi bawah (lihat dashboard-layout.tsx), jadi
// bilah pada `bottom-6` akan tertimpa navbar. 24 (96px) melewatinya.
// ============================================================================

import * as React from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/shared/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface CollectionBulkBarProps {
  /** Jumlah baris tercentang. `0` merender null — lihat catatan di bawah. */
  count: number;
  /** Label bilah untuk pembaca layar, mis. "Aksi untuk 3 produk terpilih". */
  toolbarLabel: string;
  /** Kalimat hitungan yang terbaca, mis. "3 produk dipilih". */
  countLabel: string;
  clearLabel: string;
  onClear: () => void;
  /** Tombol aksi — Hapus, Aktifkan, dan seterusnya. */
  children: React.ReactNode;
  className?: string;
}

export function CollectionBulkBar({
  count,
  toolbarLabel,
  countLabel,
  clearLabel,
  onClear,
  children,
  className,
}: CollectionBulkBarProps) {
  const barRef = React.useRef<HTMLDivElement>(null);

  // Panah kiri/kanan berpindah antar tombol, Home/End ke ujung, Escape
  // membatalkan pilihan. Ini kontrak `role="toolbar"` di ARIA: sebuah
  // toolbar diperlakukan sebagai SATU perhentian Tab, dan isinya dijelajahi
  // dengan panah. Tanpa ini, `role` di markup berbohong.
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const tombol = barRef.current?.querySelectorAll('button');
    if (!tombol?.length) return;

    const posisi = Array.from(tombol).findIndex(
      (b) => b === document.activeElement,
    );

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        tombol[(posisi + 1) % tombol.length]?.focus();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        tombol[posisi <= 0 ? tombol.length - 1 : posisi - 1]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        tombol[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        tombol[tombol.length - 1]?.focus();
        break;
      case 'Escape': {
        // Escape yang datang DARI dalam dropdown milik dropdown itu, bukan
        // milik bilah ini. Radix sudah menutup menunya sebelum handler ini
        // jalan, jadi keadaannya tidak bisa ditanyakan — yang bisa diperiksa
        // elemen asalnya.
        const target = event.target as HTMLElement | null;
        const aktif = document.activeElement as HTMLElement | null;
        const dariDropdown =
          target?.closest('[data-slot="dropdown-menu-trigger"]') ||
          target?.closest('[data-slot="dropdown-menu-content"]') ||
          aktif?.closest('[data-slot="dropdown-menu-trigger"]') ||
          aktif?.closest('[data-slot="dropdown-menu-content"]');
        if (dariDropdown) return;

        event.preventDefault();
        onClear();
        break;
      }
    }
  };

  // Bilah yang selalu ada dengan tombol yang selalu mati cuma mengambil ruang
  // dan mengajari penjual untuk mengabaikannya.
  if (count === 0) return null;

  return (
    <div
      ref={barRef}
      role="toolbar"
      aria-label={toolbarLabel}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={cn(
        'fixed bottom-24 left-1/2 z-50 -translate-x-1/2 md:bottom-6',
        'rounded-[var(--shape-panel)] border bg-popover/95 p-2 shadow-xl backdrop-blur-lg',
        'supports-[backdrop-filter]:bg-popover/80',
        'flex items-center gap-2',
        // Muncul dari bawah, bukan berkedip masuk. Durasinya pendek: bilah
        // ini menjawab centang penjual, dan jawaban yang lambat terbaca
        // sebagai lag.
        'animate-in fade-in slide-in-from-bottom-2 duration-200',
        className,
      )}
    >
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onClear}
        aria-label={clearLabel}
        title={clearLabel}
        className="size-7"
      >
        <X className="size-3.5" />
      </Button>

      <Separator orientation="vertical" className="h-5" aria-hidden />

      <div className="flex items-center gap-2 pe-1 text-body-sm">
        <Badge className="min-w-6 justify-center tabular-nums">{count}</Badge>
        <span className="hidden sm:inline">{countLabel}</span>
      </div>

      <Separator orientation="vertical" className="h-5" aria-hidden />

      {children}
    </div>
  );
}
