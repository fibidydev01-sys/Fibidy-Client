'use client';

// ============================================================================
// COLLECTION PAGER — baris per halaman + navigasi halaman bernomor
// File: src/components/dashboard/shared/collection-pager.tsx
//
// Sebelum berkas ini ada, `pagination.tsx` cuma punya SATU pemakai di seluruh
// dasbor (Kasir Riwayat), sementara Produk merender seluruh koleksinya
// sekaligus. Toko dengan 400 produk menggambar 400 kartu dalam satu render —
// tidak terasa saat mengembangkan dengan tiga produk contoh, sangat terasa di
// ponsel penjual.
//
// ── NOMOR HALAMAN: KEPUTUSAN YANG DIBALIK ──────────────────────────────────
//
// Versi pertama sengaja TIDAK menampilkan nomor, dengan alasan: koleksi di
// sini jarang lebih dari beberapa halaman, dan deretan nomor di ponsel makan
// ruang yang lebih berguna untuk tombolnya.
//
// Alasan itu setengah benar, dan setengah yang salah adalah yang penting.
// Tanpa nomor, satu-satunya cara mencapai halaman 7 adalah menekan "next"
// enam kali; dan tanpa tombol lompat-ke-akhir, produk tertua di koleksi 400
// item praktis tidak terjangkau. Yang benar dari alasan itu cuma bagian
// ponselnya — dan itu diselesaikan dengan MENYEMBUNYIKAN nomor di lebar
// sempit, bukan dengan meniadakannya di semua lebar.
//
// Bentuknya sekarang mengikuti bilah bawah EAS persis: pemilih baris di kiri,
// lalu « ‹ [1][2][3]…[50] › » di kanan. Ambang sempit/lebarnya dibaca dari
// CONTAINER (`@2xl/content`, `@max-md/content`) — bukan viewport — karena
// yang menentukan muat atau tidak adalah lebar PANEL, dan panel itu menciut
// ~256px begitu sidebar dibuka. Konteksnya dipasang SidebarInset.
// ============================================================================

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';

export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100] as const;

/**
 * Deret nomor yang ditampilkan, dengan elipsis.
 *
 * Paling banyak lima tombol nomor, apa pun jumlah halamannya — itu yang
 * menjaga lebarnya tetap bisa diperkirakan. Halaman pertama dan terakhir
 * SELALU ikut supaya kedua ujung koleksi selalu satu ketukan.
 *
 *   ≤5 halaman   [1][2][3][4][5]
 *   di awal      [1][2][3][4] … [50]
 *   di tengah    [1] … [6][7][8] … [50]
 *   di akhir     [1] … [47][48][49][50]
 */
export function getPageNumbers(
  currentPage: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  const MAX_TOMBOL = 5;
  if (totalPages <= MAX_TOMBOL) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      'ellipsis',
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    'ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis',
    totalPages,
  ];
}

interface CollectionPagerProps {
  page: number;
  totalPages: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  className?: string;
}

export function CollectionPager({
  page,
  totalPages,
  perPage,
  onPageChange,
  onPerPageChange,
  className,
}: CollectionPagerProps) {
  const t = useTranslations('dashboard.products.collection');

  // Satu halaman berarti tidak ada yang bisa dinavigasi, dan pemilih
  // baris-per-halaman pun tidak mengubah apa pun. Bilah yang tidak
  // mengerjakan apa-apa lebih baik tidak ada.
  if (totalPages <= 1) return null;

  const nomor = getPageNumbers(page, totalPages);

  return (
    <div
      data-collection-pager
      className={cn(
        'flex items-center justify-between gap-4 overflow-clip',
        '@max-2xl/content:flex-col-reverse @max-2xl/content:items-stretch',
        className,
      )}
      style={{ overflowClipMargin: 1 }}
    >
      {/* Kiri: baris per halaman. Di panel sempit ia berbagi baris dengan
          posisi halaman, supaya keduanya tidak menghabiskan dua baris untuk
          informasi yang muat dalam satu. */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Select
            value={String(perPage)}
            onValueChange={(v) => onPerPageChange(Number(v))}
          >
            <SelectTrigger size="sm" className="w-[84px]" aria-label={t('rowsPerPage')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {ROWS_PER_PAGE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-body-sm text-muted-foreground">
            {t('rowsPerPage')}
          </span>
        </div>

        {/* Posisi halaman sebagai teks — muncul HANYA saat nomornya
            disembunyikan. Dua-duanya sekaligus cuma mengatakan hal yang sama
            dua kali. */}
        <span className="text-body-sm tabular-nums text-muted-foreground @2xl/content:hidden">
          {t('pageOf', { page, total: totalPages })}
        </span>
      </div>

      {/* Kanan: navigasi */}
      <div className="flex items-center justify-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t('first')}
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          className="@max-md/content:hidden"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t('prev')}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>

        {/* Nomor halaman. Disembunyikan di panel sempit — di sana posisi
            halaman sudah dilaporkan sebagai teks di sebelah kiri. */}
        <div className="flex items-center gap-1 @max-2xl/content:hidden">
          {nomor.map((n, i) =>
            n === 'ellipsis' ? (
              <span
                key={`gap-${i}`}
                aria-hidden
                className="px-1 text-body-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={n}
                variant={n === page ? 'default' : 'outline'}
                size="sm"
                aria-label={t('goToPage', { page: n })}
                aria-current={n === page ? 'page' : undefined}
                onClick={() => onPageChange(n)}
                className="h-8 min-w-8 px-2 tabular-nums"
              >
                {n}
              </Button>
            ),
          )}
        </div>

        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t('next')}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t('last')}
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="@max-md/content:hidden"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
