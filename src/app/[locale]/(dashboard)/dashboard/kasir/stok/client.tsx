'use client';

// ============================================================================
// KELOLA STOK
// File: src/app/[locale]/(dashboard)/dashboard/kasir/stok/client.tsx
//
// Ringkasan di atas (total nilai, menipis, habis) lalu daftar produk urut
// dari stok paling kritis. Urutan ini disengaja: yang butuh tindakan muncul
// duluan tanpa perlu dicari atau difilter.
//
// [UI/UX — Agu 2026]
//   • Lebar dari KasirPageShell.
//   • Ringkasan jadi tiga KasirStatCard terpisah, bukan satu Card dengan
//     `CardContent p-0 divide-x`. Bentuknya kini sama persis dengan ringkasan
//     di Laporan — dulu dua halaman itu menggambar tiga angka dengan dua cara
//     yang sama sekali berbeda.
//   • Di ≥md daftarnya <Table> dengan kolom Stok, Min, dan Nilai yang sejajar;
//     angka yang sejajar bisa dibandingkan sekali lirik. Di bawah md kartu.
//   • <Progress> memberi bentuk pada angka stok: batang yang hampir habis
//     terbaca sebelum angkanya dibaca.
//   • Semua penyaringan dan pengurutan di sisi klien — laporan stok satu tenant
//     memang datang sekali ambil dan ukurannya wajar.
//   • Ringkasan dan daftar produk dibungkus SATU `div flex flex-col gap-4`.
//     Sebelumnya keduanya dirender sebagai sibling langsung dari
//     KasirPageShell — shell memang memberi `gap-4` di level ATASNYA (antara
//     header/toolbar/children), tapi TIDAK meneruskannya ke dalam children
//     itu sendiri. Akibatnya kartu ringkasan dan tabel/list produk menempel
//     tanpa jarak sama sekali, persis di titik yang paling sering dilihat
//     kasir tiap membuka tab ini. `gap-4` dipilih supaya sama dengan jarak
//     antar-blok yang sudah dipakai shell, bukan angka baru.
// ============================================================================

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertTriangle,
  Boxes,
  ClipboardCheck,
  MoreHorizontal,
  PackagePlus,
  Wallet,
  Plus,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPriceIDR } from '@/lib/shared/format';
import { useStockReport } from '@/hooks/dashboard/use-kasir';
import { KasirPageShell } from '@/components/dashboard/kasir/kasir-page-shell';
import { KasirFilterGroup } from '@/components/dashboard/kasir/kasir-filter-group';
import { KasirSearchField } from '@/components/dashboard/kasir/kasir-search-field';
import { KasirStatCard } from '@/components/dashboard/kasir/kasir-stat-card';
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
import { StokBadge } from '@/components/dashboard/kasir/kasir-badges';
import { StokKelolaSheet } from '@/components/dashboard/kasir/stok-kelola-sheet';
import type { StokProdukRingkas } from '@/types/kasir';

type Kondisi = 'SEMUA' | 'MENIPIS' | 'HABIS';
type Urutan = 'KRITIS' | 'NAMA' | 'NILAI';

/**
 * Batang stok penuh saat stok mencapai 3× ambang minimum. Angka ini bukan
 * aturan bisnis — ia cuma skala tampilan, dipilih supaya produk yang persis
 * di ambang minimum terlihat sepertiga penuh, bukan penuh atau kosong.
 */
const SKALA_AMAN = 3;

function persenStok(stok: number, minStock: number): number {
  const puncak = Math.max(minStock * SKALA_AMAN, 1);
  return Math.min(100, Math.round((stok / puncak) * 100));
}

export function StokClient() {
  const t = useTranslations('dashboard.kasir.stok');
  const tTaut = useTranslations('dashboard.kasir.emptyLinks');

  const [search, setSearch] = useState('');
  const [kondisi, setKondisi] = useState<Kondisi>('SEMUA');
  const [urutan, setUrutan] = useState<Urutan>('KRITIS');
  const [sembunyikanAman, setSembunyikanAman] = useState(false);
  const [dipilih, setDipilih] = useState<StokProdukRingkas | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useStockReport();

  const semua = useMemo(() => data?.semua ?? [], [data]);

  // Filter di sisi klien: daftar stok satu tenant selalu sekali ambil dan
  // ukurannya wajar, jadi mengetik tidak perlu memanggil server lagi.
  const produk = useMemo(() => {
    let hasil = semua;

    const q = search.trim().toLowerCase();
    if (q) hasil = hasil.filter((p) => p.name.toLowerCase().includes(q));

    if (kondisi === 'HABIS') hasil = hasil.filter((p) => p.stok <= 0);
    else if (kondisi === 'MENIPIS')
      hasil = hasil.filter((p) => p.stok > 0 && p.stok <= p.minStock);

    if (sembunyikanAman) hasil = hasil.filter((p) => p.stok <= p.minStock);

    const urut = [...hasil];
    if (urutan === 'NAMA') urut.sort((a, b) => a.name.localeCompare(b.name));
    else if (urutan === 'NILAI')
      urut.sort((a, b) => b.price * b.stok - a.price * a.stok);
    else urut.sort((a, b) => a.stok - a.minStock - (b.stok - b.minStock));

    return urut;
  }, [semua, search, kondisi, sembunyikanAman, urutan]);

  const adaFilter =
    Boolean(search.trim()) || kondisi !== 'SEMUA' || sembunyikanAman;

  const resetFilter = () => {
    setSearch('');
    setKondisi('SEMUA');
    setSembunyikanAman(false);
  };

  const aksiBaris = (p: StokProdukRingkas) => (
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => setDipilih(p)}>
        <PackagePlus className="size-4" aria-hidden />
        {t('restockTab')}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setDipilih(p)}>
        <ClipboardCheck className="size-4" aria-hidden />
        {t('opnameTab')}
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  const toolbar = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <KasirSearchField
          value={search}
          onChange={setSearch}
          placeholder={t('searchPlaceholder')}
          clearLabel={t('clearSearch')}
          className="sm:max-w-md"
        />

        <Select
          value={urutan}
          onValueChange={(v) => setUrutan(v as Urutan)}
        >
          <SelectTrigger className="sm:w-52" aria-label={t('sortLabel')}>
            <SelectValue placeholder={t('sortLabel')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="KRITIS">{t('sortCritical')}</SelectItem>
            <SelectItem value="NAMA">{t('sortName')}</SelectItem>
            <SelectItem value="NILAI">{t('sortValue')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <KasirFilterGroup
          ariaLabel={t('filterAll')}
          value={kondisi}
          onChange={(v) => setKondisi(v as Kondisi)}
          options={[
            { value: 'SEMUA', label: t('filterAll') },
            { value: 'MENIPIS', label: t('filterLow') },
            { value: 'HABIS', label: t('filterOut') },
          ]}
          // Berbagi baris `justify-between` dengan Switch di sebelahnya —
          // w-full akan mendorong Switch turun ke baris berikutnya.
          className="w-auto"
        />

        {/* Bukan pengulangan chip di sebelahnya: chip MENIPIS memilih produk
            yang stoknya di atas nol tapi di bawah minimum, chip HABIS memilih
            yang nol. Tidak ada chip yang menampilkan KEDUANYA sekaligus —
            padahal itulah daftar belanja yang sebenarnya dibutuhkan seller. */}
        <div className="flex items-center gap-2">
          <Switch
            id="hanya-perlu-tindakan"
            checked={sembunyikanAman}
            onCheckedChange={setSembunyikanAman}
          />
          <Label htmlFor="hanya-perlu-tindakan" className="text-sm font-normal">
            {t('onlyActionNeeded')}
          </Label>
        </div>
      </div>
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
      {/* Ringkasan + daftar dibungkus satu wrapper supaya gap-4 berlaku DI
          ANTARA keduanya. Shell hanya memberi gap ke level di atasnya
          (header/toolbar/children) — tanpa wrapper ini kedua blok di bawah
          menempel tanpa jarak, walau tampilannya masing-masing sudah benar. */}
      <div className="flex flex-col gap-4">
        {/* Ringkasan */}
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[104px] w-full rounded-[var(--shape-panel)]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <KasirStatCard
              label={t('totalValue')}
              value={formatPriceIDR(data?.totalNilai ?? 0)}
              icon={<Wallet className="size-3.5" aria-hidden />}
            />
            <KasirStatCard
              label={t('lowCount')}
              value={data?.jumlahMenipis ?? 0}
              tone="warning"
              icon={<AlertTriangle className="size-3.5" aria-hidden />}
            />
            <KasirStatCard
              label={t('outCount')}
              value={data?.jumlahHabis ?? 0}
              tone="danger"
              icon={<XCircle className="size-3.5" aria-hidden />}
            />
          </div>
        )}

        {/* Daftar produk */}
        {isLoading ? (
          <KasirRowsSkeleton rows={6} trailing="amount" />
        ) : produk.length === 0 ? (
          // Tersaring vs benar-benar kosong — dibedakan seperti di tab Jual.
          adaFilter ? (
            <KasirEmptyState
              icon={<Boxes />}
              title={search.trim() ? t('noMatchTitle') : t('noFilterMatchTitle')}
              description={
                search.trim()
                  ? t('noMatchDescription')
                  : t('noFilterMatchDescription')
              }
            >
              <Button variant="outline" onClick={resetFilter}>
                {t('resetFilter')}
              </Button>
            </KasirEmptyState>
          ) : (
            <EmptyPanel
              icon={<Boxes />}
              title={t('emptyTitle')}
              description={t('emptyDescription')}
              // Stok mengikuti produk: tanpa produk tidak ada yang bisa
              // dilacak, jadi tombolnya mengantar ke form produk.
              action={{
                label: t('emptyAction'),
                icon: <Plus className="h-4 w-4" aria-hidden />,
                href: '/dashboard/products/new',
              }}
              learnLabel={tTaut('stok.learn')}
              learnHref={GUIDE.stok}
              helpLabel={tTaut('stok.help')}
            />
          )
        ) : (
          <>
            {/* ── Ponsel: kartu ─────────────────────────────────────────── */}
            <div className="space-y-2 md:hidden">
              {produk.map((p) => (
                <KasirRowCard key={p.id}>
                  <KasirRowButton onClick={() => setDipilih(p)}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{p.name}</span>
                        <StokBadge stok={p.stok} minStock={p.minStock} />
                      </div>
                      <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                        {t('rowValue', {
                          nilai: formatPriceIDR(p.price * p.stok),
                          min: p.minStock,
                        })}
                      </p>
                      <Progress
                        value={persenStok(p.stok, p.minStock)}
                        aria-label={t('stockLevel')}
                        className="mt-2 h-1.5"
                      />
                    </div>

                    <span className="shrink-0 text-right">
                      <span className="block text-lg font-bold tabular-nums">
                        {p.stok}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {t('unit')}
                      </span>
                    </span>
                  </KasirRowButton>
                </KasirRowCard>
              ))}
            </div>

            {/* ── Desktop: tabel ────────────────────────────────────────── */}
            <Card className="hidden py-0 md:block">
              <Table>
                {/* <caption> wajib jadi anak pertama <table>. */}
                <TableCaption className="mb-4">
                  {t('tableCaption', {
                    tampil: produk.length,
                    total: semua.length,
                  })}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">{t('colName')}</TableHead>
                    <TableHead>{t('colCategory')}</TableHead>
                    <TableHead className="w-40">{t('colStock')}</TableHead>
                    <TableHead className="text-right">{t('colMin')}</TableHead>
                    <TableHead className="text-right">{t('colValue')}</TableHead>
                    <TableHead className="w-10 pr-4">
                      <span className="sr-only">{t('actionsColumn')}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {produk.map((p) => (
                    <TableRow
                      key={p.id}
                      onClick={() => setDipilih(p)}
                      className="cursor-pointer"
                    >
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{p.name}</span>
                          <StokBadge stok={p.stok} minStock={p.minStock} />
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.category ?? '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="w-10 shrink-0 font-semibold tabular-nums">
                            {p.stok}
                          </span>
                          <Progress
                            value={persenStok(p.stok, p.minStock)}
                            aria-label={t('stockLevel')}
                            className="h-1.5"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {p.minStock}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPriceIDR(p.price * p.stok)}
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
                          {aksiBaris(p)}
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            </Card>
          </>
        )}
      </div>

      <StokKelolaSheet produk={dipilih} onClose={() => setDipilih(null)} />
    </KasirPageShell>
  );
}