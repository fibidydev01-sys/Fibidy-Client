'use client';

// ============================================================================
// KASIR STATE BLOCKS — loading / error / kosong
// File: src/components/dashboard/kasir/kasir-state.tsx
//
// Empat halaman kasir dulu menyalin blok yang sama: Alert error dengan tombol
// coba lagi, Empty dengan ikon, daftar Skeleton. Salinannya sudah menyimpang —
// Papan malah memakai div `border-dashed` buatan sendiri, bukan Alert/Empty.
//
// Aturan skeleton di sini: BENTUKNYA HARUS SAMA dengan konten yang akan
// menggantikannya. Skeleton `h-[70px]` untuk baris setinggi 66px menghasilkan
// geseran di setiap pemuatan; memakai KasirRowCard yang sama membuat pergantian
// skeleton→data tidak menggeser apa pun.
//
// Teks tetap dikirim dari halaman lewat props: tiap layar punya kalimat error
// dan kosongnya sendiri di berkas terjemahan, dan menyeragamkannya di sini
// justru akan menghapus konteks yang berguna.
// ============================================================================

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/shared/utils';
import { KasirRowCard, KasirRowContent } from './kasir-row-card';

// ── Error ───────────────────────────────────────────────────────────────────

export function KasirErrorState({
  title,
  description,
  hint,
  retryLabel,
  onRetry,
  retrying,
}: {
  title: string;
  description: string;
  hint?: string;
  retryLabel: string;
  onRetry: () => void;
  retrying?: boolean;
}) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" aria-hidden />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{description}</p>
        {hint && <p className="text-xs opacity-80">{hint}</p>}
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={retrying}
          className="gap-2"
        >
          {retrying ? (
            <Spinner className="size-3.5" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          )}
          {retryLabel}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

// ── Kosong ──────────────────────────────────────────────────────────────────

export function KasirEmptyState({
  icon,
  title,
  description,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  /** CTA opsional — mis. "reset filter" atau "tambah produk". */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    // `border` tidak lagi ditambal di sini — bingkainya sudah bawaan Empty.
    // Lihat catatan di ui/empty.tsx soal kenapa ia dipindah ke primitifnya.
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {children && (
        <EmptyContent className="flex-col items-center gap-3">
          {children}
        </EmptyContent>
      )}
    </Empty>
  );
}

/** Versi ringkas tanpa ikon — untuk kolom papan yang kebetulan kosong. */
export function KasirEmptySlot({ label }: { label: string }) {
  return (
    // Kolom papan memang perlu ringkas: `min-h-0` menimpa tinggi minimum
    // bawaan supaya kolom yang kosong tidak menjulang setinggi kolom berisi.
    <Empty className="min-h-0 py-8 sm:p-8 md:p-8">
      <EmptyHeader>
        <EmptyDescription className="text-xs">{label}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

// ── Skeleton ────────────────────────────────────────────────────────────────

/**
 * Daftar baris dalam keadaan memuat. Memakai KasirRowCard yang sama dengan
 * baris sungguhan, jadi tinggi dan jaraknya identik.
 */
export function KasirRowsSkeleton({
  rows = 5,
  trailing = 'stepper',
  className,
}: {
  rows?: number;
  /** Bentuk elemen di ujung kanan baris, mengikuti baris aslinya. */
  trailing?: 'stepper' | 'amount' | 'none';
  /** Tata letaknya harus sama dengan daftar aslinya — daftar atau grid. */
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <KasirRowCard key={i}>
          <KasirRowContent>
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            {trailing === 'stepper' && <Skeleton className="h-9 w-9 rounded-[var(--shape-panel)]" />}
            {trailing === 'amount' && <Skeleton className="h-5 w-20" />}
          </KasirRowContent>
        </KasirRowCard>
      ))}
    </div>
  );
}
