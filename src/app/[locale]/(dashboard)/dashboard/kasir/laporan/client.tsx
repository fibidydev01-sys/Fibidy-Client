'use client';

// ============================================================================
// LAPORAN KASIR
// File: src/app/[locale]/(dashboard)/dashboard/kasir/laporan/client.tsx
//
// Layar "cek kesehatan toko dalam 5 detik": omzet, tren 7 hari, produk
// terlaris, stok kritis, dan pemakaian diskon. READ-ONLY — tidak ada satu
// pun aksi transaksi di sini.
//
// [UI/UX — Agu 2026]
//   • Lebar dari KasirPageShell, isinya dibagi jadi dua/tiga kolom di layar
//     lebar. Sebelumnya halaman ini satu kolom 672px: di monitor toko, dua
//     pertiga layar kosong sementara tabel terlaris terpotong.
//   • Grafik 7 hari sekarang <ChartContainer> + Recharts, bukan tujuh <div>
//     dengan `height: %` yang dihitung sendiri. Alasannya bukan sekadar rapi:
//     versi lama tidak punya sumbu, tidak punya tooltip yang bisa diakses
//     keyboard, dan tingginya (h-32) tidak ikut lebar layar.
//     `isAnimationActive={false}` — batang yang tumbuh dari nol setiap render
//     adalah persis jenis gerakan yang harus hilang dari layar ini.
//   • Daftar terlaris dan analisa diskon jadi <Table>. Keduanya memang tabel:
//     nama, jumlah, dan nilai yang harus dibandingkan antar baris.
//   • Ringkasan angka memakai KasirStatCard yang sama dengan halaman Stok.
// ============================================================================

import { useLocale, useTranslations } from 'next-intl';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  BarChart3,
  ChevronDown,
  ClipboardList,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/shared/utils';
import { formatDateShort, formatPriceIDR } from '@/lib/shared/format';
import { useAnalisaDiskon, useKasirRingkasan } from '@/hooks/dashboard/use-kasir';
import { KasirPageShell } from '@/components/dashboard/kasir/kasir-page-shell';
import { KasirStatCard } from '@/components/dashboard/kasir/kasir-stat-card';
import { KasirErrorState } from '@/components/dashboard/kasir/kasir-state';
import { StokBadge } from '@/components/dashboard/kasir/kasir-badges';
import type { OmzetChartPoint, TopProduk } from '@/types/kasir';

// ── Tabel terlaris ──────────────────────────────────────────────────────────
//
// Komponen level modul, bukan fungsi di dalam render: dua daftar terlaris
// memakai tata letak yang sama persis, dan mendefinisikannya di dalam
// komponen induk membuat React memasang ulang seluruh daftar tiap render.

function TopTable({
  judul,
  baris,
  t,
}: {
  judul: string;
  baris: TopProduk[];
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {judul}
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 px-0">#</TableHead>
            <TableHead className="px-2">{t('colProduct')}</TableHead>
            <TableHead className="px-2 text-right">{t('colQty')}</TableHead>
            <TableHead className="px-0 text-right">{t('colOmzet')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {baris.map((p, i) => (
            <TableRow key={p.namaProduk}>
              <TableCell className="px-0">
                <Badge
                  variant="secondary"
                  className="size-6 justify-center p-0 text-xs font-bold"
                >
                  {i + 1}
                </Badge>
              </TableCell>
              <TableCell className="max-w-0 truncate px-2">
                {p.namaProduk}
              </TableCell>
              <TableCell className="px-2 text-right tabular-nums text-muted-foreground">
                {t('qtySold', { qty: p.totalQty })}
              </TableCell>
              <TableCell className="px-0 text-right font-medium tabular-nums">
                {formatPriceIDR(p.totalOmzet)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Grafik batang 7 hari ────────────────────────────────────────────────────

function ChartTujuhHari({ data }: { data: OmzetChartPoint[] }) {
  const t = useTranslations('dashboard.kasir.laporan');

  const config = {
    total: { label: t('omzetLabel'), color: 'var(--chart-1)' },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={config}
      className="aspect-[16/7] w-full"
      aria-label={t('chartAria')}
    >
      <BarChart data={data} margin={{ left: 4, right: 4, top: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="tanggal"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(nilai: string) =>
            new Date(`${nilai}T00:00:00`).toLocaleDateString('id-ID', {
              weekday: 'short',
            })
          }
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(nilai) =>
                new Date(`${nilai}T00:00:00`).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                })
              }
              formatter={(value) => formatPriceIDR(Number(value))}
            />
          }
        />
        <Bar
          dataKey="total"
          fill="var(--color-total)"
          radius={4}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  );
}

// ── Halaman ─────────────────────────────────────────────────────────────────

export function LaporanClient() {
  const t = useTranslations('dashboard.kasir.laporan');
  const locale = useLocale();

  const { data, isLoading, isError, refetch, isFetching } = useKasirRingkasan();
  const { data: analisa } = useAnalisaDiskon();

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

  if (isLoading) {
    return (
      <KasirPageShell title={t('title')} subtitle={t('subtitle')}>
        {/* Skeleton mengikuti bentuk akhir: tiga kartu angka, lalu grid kartu.
            Bentuk yang berbeda dari hasilnya akan menggeser layar saat data
            datang — itu yang terjadi sebelum ini. */}
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </KasirPageShell>
    );
  }

  const omzet = data?.omzet;
  const topBarang = data?.topProduk?.barang ?? [];
  const topLayanan = data?.topProduk?.layanan ?? [];
  const stok = data?.laporanStok;
  const belumDibayar = data?.pesananBelumDibayar;
  const pekerjaan = data?.pekerjaanTertunda;

  const adaTerlaris = topBarang.length > 0 || topLayanan.length > 0;

  return (
    <KasirPageShell title={t('title')} subtitle={t('subtitle')}>
      {/* [J5] Dua hal yang butuh TINDAKAN, ditaruh di atas omzet.
          Omzet adalah kabar; ini adalah pekerjaan. Keduanya hanya muncul
          kalau angkanya bukan nol — kartu "0 pesanan belum dibayar" yang
          selalu ada tiap hari melatih mata untuk melewatinya. */}
      {(!!belumDibayar?.jumlah || !!pekerjaan?.total) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {!!belumDibayar?.jumlah && (
            <KasirStatCard
              href="/dashboard/kasir/riwayat"
              label={t('belumDibayarTitle')}
              value={formatPriceIDR(belumDibayar.nilai)}
              tone="warning"
              icon={<Wallet className="size-3.5" aria-hidden />}
              hint={
                <>
                  {t('belumDibayarCount', { jumlah: belumDibayar.jumlah })}
                  {belumDibayar.terlamaAt && (
                    <>
                      {' · '}
                      {t('belumDibayarTerlama', {
                        tanggal: formatDateShort(belumDibayar.terlamaAt, locale),
                      })}
                    </>
                  )}
                </>
              }
            />
          )}

          {!!pekerjaan?.total && (
            <KasirStatCard
              href="/dashboard/kasir/papan"
              label={t('pekerjaanTitle')}
              value={pekerjaan.total}
              icon={<ClipboardList className="size-3.5" aria-hidden />}
              hint={
                pekerjaan.terlambat > 0 ? (
                  <span className="font-medium text-destructive">
                    {t('pekerjaanTerlambat', { jumlah: pekerjaan.terlambat })}
                  </span>
                ) : (
                  t('pekerjaanOnTrack')
                )
              }
            />
          )}
        </div>
      )}

      {/* Omzet hari / minggu / bulan */}
      <div className="grid gap-3 sm:grid-cols-3">
        {(['hari', 'minggu', 'bulan'] as const).map((periode) => (
          <KasirStatCard
            key={periode}
            label={t(periode)}
            value={formatPriceIDR(omzet?.[periode]?.total ?? 0)}
            hint={t('trxCount', {
              jumlah: omzet?.[periode]?.jumlahTransaksi ?? 0,
            })}
          />
        ))}
      </div>

      {/* [J5] Kalimat ini penting untuk toko jasa: pesanan yang masuk Senin
          dan dibayar Rabu masuk omzet RABU. Tanpa penjelasan ini, seller akan
          mengira angka hari Senin-nya hilang. */}
      <p className="-mt-1 px-1 text-[11px] leading-snug text-muted-foreground">
        {t('basisKas')}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Tren 7 hari */}
        <Card className={cn(!adaTerlaris && 'lg:col-span-2')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden />
              {t('chartTitle')}
            </CardTitle>
            <CardDescription>{t('chartUnit')}</CardDescription>
          </CardHeader>
          <CardContent>
            {omzet?.chart?.length ? (
              <ChartTujuhHari data={omzet.chart} />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {t('chartEmpty')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Terlaris — barang dan layanan berdiri sendiri-sendiri. Daftar yang
            seluruhnya kosong tidak digambar sama sekali; toko produk murni
            tidak perlu melihat judul "Layanan terlaris" yang selamanya kosong
            (G7 dalam bentuk lain). */}
        {adaTerlaris && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <BarChart3
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden
                />
                {t('topProdukTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topBarang.length > 0 && (
                <TopTable judul={t('topBarang')} baris={topBarang} t={t} />
              )}
              {topLayanan.length > 0 && (
                <TopTable judul={t('topLayanan')} baris={topLayanan} t={t} />
              )}
            </CardContent>
          </Card>
        )}

        {/* Laporan stok ringkas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('stokTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted/50 px-2 py-2">
                <p className="text-[11px] text-muted-foreground">
                  {t('stokValue')}
                </p>
                <p className="text-sm font-bold tabular-nums">
                  {formatPriceIDR(stok?.totalNilai ?? 0)}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-2 py-2">
                <p className="text-[11px] text-muted-foreground">
                  {t('stokLow')}
                </p>
                <p className="text-sm font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  {stok?.jumlahMenipis ?? 0}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-2 py-2">
                <p className="text-[11px] text-muted-foreground">
                  {t('stokOut')}
                </p>
                <p className="text-sm font-bold tabular-nums text-destructive">
                  {stok?.jumlahHabis ?? 0}
                </p>
              </div>
            </div>

            {(stok?.produkKritis?.length ?? 0) > 0 && (
              // Dilipat, bukan dipotong: di ponsel daftar ini bisa sepanjang
              // layar dan mendorong kartu diskon jauh ke bawah.
              <Collapsible defaultOpen className="group/kritis">
                <Separator className="mb-3" />
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between px-1"
                  >
                    {t('stokKritisTitle')}
                    <ChevronDown
                      className="size-4 transition-transform group-data-[state=open]/kritis:rotate-180"
                      aria-hidden
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <ul className="space-y-1.5">
                    {stok!.produkKritis.map((p) => (
                      <li key={p.id} className="flex items-center gap-2 text-sm">
                        <span className="min-w-0 flex-1 truncate">{p.name}</span>
                        <StokBadge stok={p.stok} minStock={p.minStock} />
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>

        {/* Analisa diskon bulan ini */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('diskonTitle')}</CardTitle>
            {!!analisa?.rincian.length && (
              <CardDescription className="tabular-nums">
                {t('diskonTotal')}
                {': '}
                <span className="font-semibold text-foreground">
                  {formatPriceIDR(analisa.totalDiskonBulanIni)}
                </span>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {!analisa || analisa.rincian.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t('diskonEmpty')}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 px-0">%</TableHead>
                    <TableHead className="px-2">
                      {t('colDiskonName')}
                    </TableHead>
                    <TableHead className="px-2 text-right">
                      {t('colDiskonUsed')}
                    </TableHead>
                    <TableHead className="px-0 text-right">
                      {t('colDiskonTotal')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analisa.rincian.map((row) => (
                    <TableRow key={row.diskonPresetId ?? row.nama}>
                      <TableCell className="px-0">
                        <Badge
                          variant="secondary"
                          className="px-1.5 text-xs font-bold tabular-nums"
                        >
                          {row.persen}%
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-0 truncate px-2">
                        {row.nama}
                      </TableCell>
                      <TableCell className="px-2 text-right tabular-nums text-muted-foreground">
                        {t('diskonUsed', { jumlah: row.jumlahDipakai })}
                      </TableCell>
                      <TableCell className="px-0 text-right font-medium tabular-nums">
                        {formatPriceIDR(row.totalDiskon)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </KasirPageShell>
  );
}
