'use client';

// ============================================================================
// RIWAYAT TRANSAKSI
// File: src/app/[locale]/(dashboard)/dashboard/kasir/riwayat/client.tsx
//
// Satu layar, satu tugas: MELIHAT transaksi lampau. Tidak ada jalan membuat
// transaksi baru dari sini — itu tugas tab Jual.
//
// Baris VOID dan REFUND diberi badge warna berbeda supaya terlihat sekilas
// saat menyisir daftar, tanpa perlu membuka satu per satu.
//
// [UI/UX — Agu 2026]
//   • Lebar dari KasirPageShell, bukan `mx-auto max-w-2xl`.
//   • Di ≥md daftarnya jadi <Table>: riwayat memang data tabular (nomor,
//     waktu, metode, jumlah item, total), dan enam kolom yang sejajar jauh
//     lebih cepat disisir daripada enam baris kartu. Di bawah md tetap kartu —
//     tabel enam kolom di layar 5 inci tidak terbaca.
//   • Pencarian, filter status, dan rentang tanggal semuanya dikirim ke server;
//     halaman berpindah lewat <Pagination>, bukan mengambil 200 baris sekaligus.
//   • Data lama tidak pernah diganti skeleton saat pindah halaman atau mengetik
//     (keepPreviousData di use-kasir), hanya diredupkan.
// ============================================================================

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  History,
  MoreHorizontal,
  ShoppingCart,
} from 'lucide-react';
import { toast } from 'sonner';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/shared/utils';
import { formatPriceIDR } from '@/lib/shared/format';
import { useDebounce } from '@/hooks/shared/use-debounce';
import { useTransaksis } from '@/hooks/dashboard/use-kasir';
import { KasirPageShell } from '@/components/dashboard/kasir/kasir-page-shell';
import { KasirFilterGroup } from '@/components/dashboard/kasir/kasir-filter-group';
import { KasirSearchField } from '@/components/dashboard/kasir/kasir-search-field';
import { useCollectionView } from '@/components/dashboard/shared/collection-toolbar';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutGrid, List } from 'lucide-react';
import {
  KasirEmptyState,
  KasirErrorState,
  KasirRowsSkeleton,
} from '@/components/dashboard/kasir/kasir-state';
import { EmptyPanel } from '@/components/dashboard/shared/empty-panel';
import { GUIDE } from '@/lib/constants/dashboard/guide-links';
import {
  KasirRowButton,
  KasirRowCard,
} from '@/components/dashboard/kasir/kasir-row-card';
import { StatusTransaksiBadge } from '@/components/dashboard/kasir/kasir-badges';
import { TransaksiDetailSheet } from '@/components/dashboard/kasir/transaksi-detail-sheet';
import type { KasirTransaksiRingkas, KasirTransaksiStatus } from '@/types/kasir';

// BELUM_BAYAR ditaruh tepat setelah "Semua": itu satu-satunya status yang
// menuntut tindakan, jadi ia harus paling mudah dijangkau.
const FILTER_STATUS: Array<KasirTransaksiStatus | null> = [
  null,
  'BELUM_BAYAR',
  'COMPLETED',
  'VOID',
  'REFUND',
];

const SEMUA = '__semua__';

// Satu layar penuh tanpa perlu scroll panjang. Sisanya lewat Pagination —
// mengambil 200 baris sekaligus membuat permintaan pertama lambat padahal
// yang dilihat kasir hampir selalu halaman pertama.
const PER_HALAMAN = 20;

function tanggalISO(d: Date): string {
  // Zona waktu lokal, bukan UTC: "hari ini" bagi kasir adalah hari di tokonya.
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function RiwayatClient() {
  const t = useTranslations('dashboard.kasir.riwayat');
  const tTaut = useTranslations('dashboard.kasir.emptyLinks');
  const tStatus = useTranslations('dashboard.kasir.status');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<KasirTransaksiStatus | null>(null);
  const [rentang, setRentang] = useState<DateRange | undefined>();
  const [halaman, setHalaman] = useState(1);
  const [dipilih, setDipilih] = useState<string | null>(null);

  // `fallback: 'list'` — di desktop riwayat memang lebih terbaca sebagai
  // tabel, dan itu perilaku yang sudah ada sebelum toggle ini. Yang berubah
  // cuma: sekarang bisa ditimpa.
  const [tampilan, setTampilan] = useCollectionView(
    'fibidy:view:kasir-riwayat',
    'list',
  );
  const debouncedSearch = useDebounce(search, 300);

  // Filter apa pun mengembalikan pembaca ke halaman 1. Tanpa ini, menyaring
  // dari halaman 5 menghasilkan layar kosong yang tampak seperti "tidak ada
  // data" padahal datanya ada di halaman 1.
  //
  // Dilakukan di dalam handler, bukan useEffect yang mengintai perubahan
  // filter: efek semacam itu menjalankan satu render tambahan dengan kombinasi
  // (filter baru × halaman lama) yang sempat dikirim ke server sebagai
  // permintaan yang langsung dibatalkan.
  const ubahSearch = (v: string) => {
    setSearch(v);
    setHalaman(1);
  };

  const ubahStatus = (v: KasirTransaksiStatus | null) => {
    setStatus(v);
    setHalaman(1);
  };

  const ubahRentang = (v: DateRange | undefined) => {
    setRentang(v);
    setHalaman(1);
  };

  const { data, isLoading, isError, refetch, isFetching } = useTransaksis({
    page: halaman,
    limit: PER_HALAMAN,
    ...(status ? { status } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(rentang?.from ? { tanggalMulai: tanggalISO(rentang.from) } : {}),
    ...(rentang?.to ? { tanggalSelesai: tanggalISO(rentang.to) } : {}),
  });

  const transaksis = data?.data ?? [];
  const meta = data?.meta;
  const totalHalaman = meta?.totalPages ?? 1;

  const adaFilter = Boolean(debouncedSearch || status || rentang?.from);

  const labelRentang = useMemo(() => {
    if (!rentang?.from) return t('dateAll');
    const fmt = (d: Date) =>
      d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    return rentang.to && rentang.to.getTime() !== rentang.from.getTime()
      ? `${fmt(rentang.from)} – ${fmt(rentang.to)}`
      : fmt(rentang.from);
  }, [rentang, t]);

  const salinNomor = async (nomorOrder: string) => {
    try {
      await navigator.clipboard.writeText(nomorOrder);
      toast.success(t('copiedOrder'));
    } catch {
      // Clipboard ditolak (konteks non-HTTPS / izin). Tidak ada yang perlu
      // dilaporkan ke kasir — nomornya toh masih terbaca di layar.
    }
  };

  const waktuSingkat = (iso: string) =>
    new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  // VOID/REFUND dicoret: angkanya masih ada di riwayat, tapi tidak lagi
  // dihitung sebagai omzet. BELUM_BAYAR TIDAK dicoret — uangnya belum masuk,
  // tapi tagihannya masih hidup dan justru harus terbaca jelas.
  const kelasTotal = (trx: KasirTransaksiRingkas) =>
    cn(
      'font-semibold tabular-nums',
      (trx.status === 'VOID' || trx.status === 'REFUND') &&
        'text-muted-foreground line-through',
      trx.status === 'BELUM_BAYAR' && 'text-amber-600 dark:text-amber-400',
    );

  const aksiBaris = (trx: KasirTransaksiRingkas) => (
    <>
      <DropdownMenuItem onClick={() => setDipilih(trx.id)}>
        <Eye className="size-4" aria-hidden />
        {t('viewDetail')}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => salinNomor(trx.nomorOrder)}>
        <Copy className="size-4" aria-hidden />
        {t('copyOrder')}
      </DropdownMenuItem>
    </>
  );

  const toolbar = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <KasirSearchField
          value={search}
          onChange={ubahSearch}
          busy={isFetching && !isLoading}
          placeholder={t('searchPlaceholder')}
          clearLabel={t('clearSearch')}
          className="sm:max-w-md"
        />

        {/* Toggle grid⇄daftar. Riwayat sudah menyimpan DUA tampilan lengkap
            sejak awal — KasirRowCard dan <Table> — tapi memilihnya lewat
            breakpoint. Sekarang breakpoint jadi NILAI BAKU, bukan aturan:
            ponsel terbuka sebagai kartu, desktop sebagai tabel, dan penjual
            boleh menimpanya. Pilihannya diingat, jadi kasir yang lebih suka
            kartu di layar lebar tidak memilih ulang setiap pagi.

            Bilah ini TIDAK memakai CollectionToolbar. Pencarian di sini
            sudah debounce dan disaring di server bersama status dan rentang
            tanggal; menggantinya dengan penyaring sisi-klien yang generik
            akan menurunkan kualitasnya, bukan menyeragamkannya. Yang dipakai
            ulang cuma `useCollectionView` — bagian yang memang sama. */}
        <ToggleGroup
          type="single"
          value={tampilan}
          onValueChange={(v) => v && setTampilan(v as 'grid' | 'list')}
          variant="outline"
          className="order-last shrink-0 sm:order-none sm:ml-auto"
        >
          <ToggleGroupItem value="grid" aria-label={t('viewGrid')}>
            <LayoutGrid className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label={t('viewList')}>
            <List className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start gap-2 sm:w-auto">
              <CalendarDays className="size-4" aria-hidden />
              {labelRentang}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={rentang}
              onSelect={ubahRentang}
              numberOfMonths={1}
              autoFocus
            />
            {rentang?.from && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => ubahRentang(undefined)}
                >
                  {t('dateReset')}
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <KasirFilterGroup
        ariaLabel={t('colStatus')}
        value={status ?? SEMUA}
        onChange={(next) =>
          ubahStatus(next === SEMUA ? null : (next as KasirTransaksiStatus))
        }
        options={FILTER_STATUS.map((s) => ({
          value: s ?? SEMUA,
          label: s ? tStatus(s.toLowerCase()) : t('allStatus'),
        }))}
      />
    </div>
  );

  if (isError) {
    return (
      <KasirPageShell title={t('title')} subtitle={t('subtitle')}>
        <KasirErrorState
          title={t('errorTitle')}
          description={t('errorDescription')}
          retryLabel={t('retry')}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      </KasirPageShell>
    );
  }

  return (
    <KasirPageShell
      title={t('title')}
      subtitle={t('subtitle')}
      toolbar={toolbar}
    >
      {isLoading ? (
        <KasirRowsSkeleton rows={6} trailing="amount" />
      ) : transaksis.length === 0 ? (
        // Tersaring vs benar-benar kosong — dibedakan seperti di tab Jual.
        adaFilter ? (
          <KasirEmptyState
            icon={<History />}
            title={t('noMatchTitle')}
            description={t('noMatchDescription')}
          >
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatus(null);
                setRentang(undefined);
                setHalaman(1);
              }}
            >
              {t('dateReset')}
            </Button>
          </KasirEmptyState>
        ) : (
          <EmptyPanel
            icon={<History />}
            title={t('emptyTitle')}
            description={t('emptyDescription')}
            // Riwayat tidak bisa diisi dari sini — transaksinya lahir di tab
            // Jual. Jadi tombolnya mengantar ke sana, bukan ke form produk.
            action={{
              label: t('emptyAction'),
              icon: <ShoppingCart className="h-4 w-4" aria-hidden />,
              href: '/dashboard/kasir',
            }}
            learnLabel={tTaut('riwayat.learn')}
            learnHref={GUIDE.kasir}
            helpLabel={tTaut('riwayat.help')}
          />
        )
      ) : (
        <div className={cn('space-y-4 transition-opacity', isFetching && 'opacity-60')}>
          {/* ── Ponsel: kartu ─────────────────────────────────────────── */}
          <div className={cn('space-y-2', tampilan === 'list' ? 'hidden' : 'md:hidden')}>
            {transaksis.map((trx) => (
              <KasirRowCard key={trx.id}>
                <KasirRowButton onClick={() => setDipilih(trx.id)}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium tabular-nums">
                        {trx.nomorOrder}
                      </span>
                      {trx.status !== 'COMPLETED' && (
                        <StatusTransaksiBadge status={trx.status} />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {waktuSingkat(trx.createdAt)}
                      {' · '}
                      {/* Pesanan yang belum dibayar belum punya metode — menulis
                          "null" di situ lebih buruk daripada menyebut keadaannya. */}
                      {trx.paymentMethod ?? t('unpaidMethod')}
                      {' · '}
                      {t('itemCount', { jumlah: trx._count?.items ?? 0 })}
                    </p>
                  </div>

                  <span className={cn('shrink-0', kelasTotal(trx))}>
                    {formatPriceIDR(trx.grandTotal)}
                  </span>
                </KasirRowButton>
              </KasirRowCard>
            ))}
          </div>

          {/* ── Desktop: tabel ────────────────────────────────────────── */}
          <Card className={cn('py-0', tampilan === 'list' ? 'block' : 'hidden md:block')}>
            <Table>
              {/* <caption> wajib jadi anak pertama <table>; kelas
                  `caption-bottom` bawaan Table yang menaruhnya di bawah
                  secara visual. */}
              {meta && (
                <TableCaption className="mb-4">
                  {t('tableCaption', {
                    tampil: transaksis.length,
                    total: meta.total,
                  })}
                </TableCaption>
              )}
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">{t('colOrder')}</TableHead>
                  <TableHead>{t('colTime')}</TableHead>
                  <TableHead>{t('colMethod')}</TableHead>
                  <TableHead className="text-right">{t('colItems')}</TableHead>
                  <TableHead>{t('colStatus')}</TableHead>
                  <TableHead className="text-right">{t('colTotal')}</TableHead>
                  <TableHead className="w-10 pr-4">
                    <span className="sr-only">{t('actionsColumn')}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {transaksis.map((trx) => (
                  <ContextMenu key={trx.id}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        onClick={() => setDipilih(trx.id)}
                        className="cursor-pointer"
                      >
                        <TableCell className="pl-4 font-medium tabular-nums">
                          {trx.nomorOrder}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {waktuSingkat(trx.createdAt)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {trx.paymentMethod ?? t('unpaidMethod')}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {trx._count?.items ?? 0}
                        </TableCell>
                        <TableCell>
                          <StatusTransaksiBadge status={trx.status} />
                        </TableCell>
                        <TableCell className={cn('text-right', kelasTotal(trx))}>
                          {formatPriceIDR(trx.grandTotal)}
                        </TableCell>
                        <TableCell className="pr-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={t('rowActions')}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="size-4" aria-hidden />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {aksiBaris(trx)}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    </ContextMenuTrigger>

                    {/* Klik kanan di desktop — jalur yang sama dengan menu titik
                        tiga, untuk tangan yang sudah terbiasa dengan mouse. */}
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => setDipilih(trx.id)}>
                        <Eye className="size-4" aria-hidden />
                        {t('viewDetail')}
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => salinNomor(trx.nomorOrder)}>
                        <Copy className="size-4" aria-hidden />
                        {t('copyOrder')}
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </TableBody>

            </Table>
          </Card>

          {totalHalaman > 1 && (
            <Pagination>
              <PaginationContent>
                {/* PaginationLink dipakai langsung, bukan PaginationPrevious /
                    PaginationNext: keduanya menulis "Previous"/"Next" sebagai
                    teks tetap berbahasa Inggris dan mengabaikan children, jadi
                    label terjemahan tidak akan pernah muncul. */}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    size="default"
                    aria-label={t('prevPage')}
                    aria-disabled={halaman <= 1}
                    className={cn(
                      'gap-1 px-2.5',
                      halaman <= 1 && 'pointer-events-none opacity-50',
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      setHalaman((p) => Math.max(1, p - 1));
                    }}
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                    <span className="hidden sm:block">{t('prevPage')}</span>
                  </PaginationLink>
                </PaginationItem>

                <PaginationItem>
                  <span className="px-3 text-sm tabular-nums text-muted-foreground">
                    {t('pageInfo', { page: halaman, total: totalHalaman })}
                  </span>
                </PaginationItem>

                <PaginationItem>
                  <PaginationLink
                    href="#"
                    size="default"
                    aria-label={t('nextPage')}
                    aria-disabled={halaman >= totalHalaman}
                    className={cn(
                      'gap-1 px-2.5',
                      halaman >= totalHalaman &&
                        'pointer-events-none opacity-50',
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      setHalaman((p) => Math.min(totalHalaman, p + 1));
                    }}
                  >
                    <span className="hidden sm:block">{t('nextPage')}</span>
                    <ChevronRight className="size-4" aria-hidden />
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      <TransaksiDetailSheet
        transaksiId={dipilih}
        onClose={() => setDipilih(null)}
      />
    </KasirPageShell>
  );
}
