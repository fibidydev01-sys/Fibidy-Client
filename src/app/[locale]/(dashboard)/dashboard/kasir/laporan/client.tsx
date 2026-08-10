'use client';

// ============================================================================
// LAPORAN KASIR
// File: src/app/[locale]/(dashboard)/dashboard/kasir/laporan/client.tsx
//
// Layar "cek kesehatan toko dalam 5 detik": omzet, tren 7 hari, produk
// terlaris, stok kritis, dan pemakaian diskon. READ-ONLY — tidak ada satu
// pun aksi transaksi di sini.
//
// Grafik 7 hari digambar dengan batang CSS biasa, bukan pustaka chart:
// tujuh angka tidak butuh sumbu, tooltip, atau skala logaritmik, dan
// menghindari pustaka chart berarti tidak ada risiko ketidakcocokan render
// server/klien pada layar yang isinya cuma tujuh batang.
// ============================================================================

import { useTranslations } from 'next-intl';
import {
  AlertCircle,
  BarChart3,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/shared/utils';
import { formatPriceIDR } from '@/lib/shared/format';
import { useAnalisaDiskon, useKasirRingkasan } from '@/hooks/dashboard/use-kasir';
import { KasirPageHeader } from '@/components/dashboard/kasir/kasir-page-header';
import { StokBadge } from '@/components/dashboard/kasir/kasir-badges';
import type { OmzetChartPoint } from '@/types/kasir';

// ── Grafik batang 7 hari ────────────────────────────────────────────────────

function ChartTujuhHari({ data }: { data: OmzetChartPoint[] }) {
  const t = useTranslations('dashboard.kasir.laporan');

  const maks = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="flex h-32 items-end gap-1.5" role="img" aria-label={t('chartAria')}>
      {data.map((titik) => {
        const tinggi = (titik.total / maks) * 100;
        const tanggal = new Date(`${titik.tanggal}T00:00:00`);

        return (
          <div key={titik.tanggal} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {titik.total > 0 ? Math.round(titik.total / 1000) : ''}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                // minHeight 2px: hari tanpa transaksi tetap punya jejak tipis,
                // jadi terbaca sebagai "nol", bukan sebagai batang yang hilang.
                style={{ height: `${Math.max(tinggi, titik.total > 0 ? 4 : 0)}%` }}
                className={cn(
                  'w-full rounded-t transition-all',
                  titik.total > 0 ? 'bg-primary' : 'bg-muted',
                  titik.total === 0 && 'min-h-[2px]',
                )}
                title={`${titik.tanggal}: ${formatPriceIDR(titik.total)}`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {tanggal.toLocaleDateString('id-ID', { weekday: 'narrow' })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Halaman ─────────────────────────────────────────────────────────────────

export function LaporanClient() {
  const t = useTranslations('dashboard.kasir.laporan');

  const { data, isLoading, isError, refetch, isFetching } = useKasirRingkasan();
  const { data: analisa } = useAnalisaDiskon();


  if (isError) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <KasirPageHeader title={t('title')} subtitle={t('subtitle')} />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden />
          <AlertTitle>{t('errorTitle')}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{t('errorDescription')}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw
                className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')}
                aria-hidden
              />
              {t('retry')}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <KasirPageHeader title={t('title')} subtitle={t('subtitle')} />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  const omzet = data?.omzet;
  const topProduk = data?.topProduk ?? [];
  const stok = data?.laporanStok;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <KasirPageHeader title={t('title')} subtitle={t('subtitle')} />

      {/* Omzet hari / minggu / bulan */}
      <Card>
        <CardContent className="grid grid-cols-3 divide-x p-0">
          {(['hari', 'minggu', 'bulan'] as const).map((periode) => (
            <div key={periode} className="px-2 py-3 text-center">
              <p className="text-xs text-muted-foreground">{t(periode)}</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums sm:text-base">
                {formatPriceIDR(omzet?.[periode]?.total ?? 0)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t('trxCount', {
                  jumlah: omzet?.[periode]?.jumlahTransaksi ?? 0,
                })}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tren 7 hari */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden />
            {t('chartTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {omzet?.chart?.length ? (
            <>
              <ChartTujuhHari data={omzet.chart} />
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                {t('chartUnit')}
              </p>
            </>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('chartEmpty')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Produk terlaris */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4 text-muted-foreground" aria-hidden />
            {t('topProdukTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topProduk.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t('topProdukEmpty')}
            </p>
          ) : (
            <ol className="space-y-2">
              {topProduk.map((p, i) => (
                <li key={p.namaProduk} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {p.namaProduk}
                  </span>
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                    {t('qtySold', { qty: p.totalQty })}
                  </span>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {formatPriceIDR(p.totalOmzet)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* Laporan stok ringkas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('stokTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-muted/50 px-2 py-2">
              <p className="text-[11px] text-muted-foreground">{t('stokValue')}</p>
              <p className="text-sm font-bold tabular-nums">
                {formatPriceIDR(stok?.totalNilai ?? 0)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 px-2 py-2">
              <p className="text-[11px] text-muted-foreground">{t('stokLow')}</p>
              <p className="text-sm font-bold tabular-nums text-amber-600 dark:text-amber-400">
                {stok?.jumlahMenipis ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 px-2 py-2">
              <p className="text-[11px] text-muted-foreground">{t('stokOut')}</p>
              <p className="text-sm font-bold tabular-nums text-destructive">
                {stok?.jumlahHabis ?? 0}
              </p>
            </div>
          </div>

          {(stok?.produkKritis?.length ?? 0) > 0 && (
            <ul className="space-y-1.5 border-t pt-3">
              {stok!.produkKritis.map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <StokBadge stok={p.stok} minStock={p.minStock} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Analisa diskon bulan ini */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('diskonTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!analisa || analisa.rincian.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t('diskonEmpty')}
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('diskonTotal')}
                </span>
                <span className="text-base font-bold tabular-nums">
                  {formatPriceIDR(analisa.totalDiskonBulanIni)}
                </span>
              </div>

              <ul className="space-y-2 border-t pt-2">
                {analisa.rincian.map((row) => (
                  <li
                    key={row.diskonPresetId ?? row.nama}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="flex h-7 shrink-0 items-center rounded-md bg-primary/10 px-1.5 text-xs font-bold text-primary">
                      {row.persen}%
                    </span>
                    <span className="min-w-0 flex-1 truncate">{row.nama}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {t('diskonUsed', { jumlah: row.jumlahDipakai })}
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {formatPriceIDR(row.totalDiskon)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
