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
// ============================================================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, History, RefreshCw, Search, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
import { useDebounce } from '@/hooks/shared/use-debounce';
import { useTransaksis } from '@/hooks/dashboard/use-kasir';
import { KasirPageHeader } from '@/components/dashboard/kasir/kasir-page-header';
import { StatusTransaksiBadge } from '@/components/dashboard/kasir/kasir-badges';
import { TransaksiDetailSheet } from '@/components/dashboard/kasir/transaksi-detail-sheet';
import type { KasirTransaksiStatus } from '@/types/kasir';

const FILTER_STATUS: Array<KasirTransaksiStatus | null> = [
  null,
  'COMPLETED',
  'VOID',
  'REFUND',
];

// Guide menyebut "200 transaksi terakhir" — cukup untuk rekap harian tanpa
// membuat halaman ini jadi arsip tak berujung.
const LIMIT = 200;

export function RiwayatClient() {
  const t = useTranslations('dashboard.kasir.riwayat');
  const tStatus = useTranslations('dashboard.kasir.status');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<KasirTransaksiStatus | null>(null);
  const [dipilih, setDipilih] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch, isFetching } = useTransaksis({
    limit: LIMIT,
    ...(status ? { status } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const transaksis = data?.data ?? [];


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

      {/* Cari + filter status */}
      <div className="space-y-3">
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

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTER_STATUS.map((s) => {
            const aktif = status === s;
            return (
              <button
                key={s ?? 'all'}
                type="button"
                onClick={() => setStatus(s)}
                aria-pressed={aktif}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  aktif
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {s ? tStatus(s.toLowerCase()) : t('allStatus')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Daftar */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[70px] w-full rounded-xl" />
          ))}
        </div>
      ) : transaksis.length === 0 ? (
        <div className="py-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <History />
              </EmptyMedia>
              <EmptyTitle>
                {search || status ? t('noMatchTitle') : t('emptyTitle')}
              </EmptyTitle>
              <EmptyDescription>
                {search || status
                  ? t('noMatchDescription')
                  : t('emptyDescription')}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="space-y-2">
          {transaksis.map((trx) => (
            <button
              key={trx.id}
              type="button"
              onClick={() => setDipilih(trx.id)}
              className="flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors hover:bg-muted/50"
            >
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
                  {new Date(trx.createdAt).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' · '}
                  {trx.paymentMethod}
                  {' · '}
                  {t('itemCount', { jumlah: trx._count?.items ?? 0 })}
                </p>
              </div>

              <span
                className={cn(
                  'shrink-0 font-semibold tabular-nums',
                  // Transaksi VOID/REFUND dicoret: angkanya masih ada di
                  // riwayat, tapi tidak lagi dihitung sebagai omzet.
                  trx.status !== 'COMPLETED' &&
                    'text-muted-foreground line-through',
                )}
              >
                {formatPriceIDR(trx.grandTotal)}
              </span>
            </button>
          ))}
        </div>
      )}

      <TransaksiDetailSheet
        transaksiId={dipilih}
        onClose={() => setDipilih(null)}
      />
    </div>
  );
}
