'use client';

// ============================================================================
// KELOLA STOK
// File: src/app/[locale]/(dashboard)/dashboard/kasir/stok/client.tsx
//
// Ringkasan di atas (total nilai, menipis, habis) lalu daftar produk urut
// dari stok paling kritis. Urutan ini disengaja: yang butuh tindakan muncul
// duluan tanpa perlu dicari atau difilter.
// ============================================================================

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, Boxes, RefreshCw, Search, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { cn } from '@/lib/shared/utils';
import { formatPriceIDR } from '@/lib/shared/format';
import { useStockReport } from '@/hooks/dashboard/use-kasir';
import { KasirPageHeader } from '@/components/dashboard/kasir/kasir-page-header';
import { StokBadge } from '@/components/dashboard/kasir/kasir-badges';
import { StokKelolaSheet } from '@/components/dashboard/kasir/stok-kelola-sheet';
import type { StokProdukRingkas } from '@/types/kasir';

export function StokClient() {
  const t = useTranslations('dashboard.kasir.stok');

  const [search, setSearch] = useState('');
  const [dipilih, setDipilih] = useState<StokProdukRingkas | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useStockReport();

  // Filter di sisi klien: daftar stok satu tenant selalu sekali ambil dan
  // ukurannya wajar, jadi mengetik tidak perlu memanggil server lagi.
  const produk = useMemo(() => {
    const semua = data?.semua ?? [];
    if (!search.trim()) return semua;
    const q = search.toLowerCase();
    return semua.filter((p) => p.name.toLowerCase().includes(q));
  }, [data, search]);


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

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <KasirPageHeader title={t('title')} subtitle={t('subtitle')} />

      {/* Ringkasan */}
      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : (
        <Card>
          <CardContent className="grid grid-cols-3 divide-x p-0">
            <div className="px-3 py-3 text-center">
              <p className="text-xs text-muted-foreground">{t('totalValue')}</p>
              <p className="mt-0.5 text-base font-bold tabular-nums">
                {formatPriceIDR(data?.totalNilai ?? 0)}
              </p>
            </div>
            <div className="px-3 py-3 text-center">
              <p className="text-xs text-muted-foreground">{t('lowCount')}</p>
              <p className="mt-0.5 text-base font-bold tabular-nums text-amber-600 dark:text-amber-400">
                {data?.jumlahMenipis ?? 0}
              </p>
            </div>
            <div className="px-3 py-3 text-center">
              <p className="text-xs text-muted-foreground">{t('outCount')}</p>
              <p className="mt-0.5 text-base font-bold tabular-nums text-destructive">
                {data?.jumlahHabis ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cari */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="pl-9 pr-9"
          aria-label={t('searchPlaceholder')}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label={t('clearSearch')}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>

      {/* Daftar produk */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : produk.length === 0 ? (
        <div className="py-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Boxes />
              </EmptyMedia>
              <EmptyTitle>
                {search ? t('noMatchTitle') : t('emptyTitle')}
              </EmptyTitle>
              <EmptyDescription>
                {search ? t('noMatchDescription') : t('emptyDescription')}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="space-y-2">
          {produk.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setDipilih(p)}
              className="flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors hover:bg-muted/50"
            >
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
              </div>

              <span className="shrink-0 text-right">
                <span className="block text-lg font-bold tabular-nums">
                  {p.stok}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  {t('unit')}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      <StokKelolaSheet produk={dipilih} onClose={() => setDipilih(null)} />
    </div>
  );
}
