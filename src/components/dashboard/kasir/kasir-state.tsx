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
// [SKELETON SIMPLIFIKASI — Agu 2026]
// KasirRowsSkeleton sebelumnya menggambar tiap baris sebagai 2-3 block
// terpisah (nama, subteks, trailing stepper/amount) yang meniru struktur
// detail baris aslinya. Diubah jadi SATU block polos per baris — sama
// spirit-nya dengan skeleton bawaan Expo: skeleton yang terlalu detail
// menambah biaya perawatan (harus diperbarui tiap desain baris berubah)
// tanpa menambah kejelasan buat pengguna. Baris kasir juga tampil dalam
// dua bentuk berbeda (list vs grid via KatalogCard) — satu block generik
// tetap valid buat keduanya, sedangkan skeleton yang meniru detail salah
// satu bentuk akan terasa salah di bentuk yang lain.
//
// Prop `trailing` (dulu menentukan bentuk elemen kanan: stepper/amount)
// DIHAPUS — sudah tidak relevan begitu barisnya jadi satu block. Tiga
// pemanggil (kasir/client.tsx, kasir/riwayat/client.tsx, kasir/stok/client.tsx)
// sudah disesuaikan.
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
import { KasirRowCard } from './kasir-row-card';

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
 *
 * Tiap baris digambar sebagai SATU block polos setinggi baris aslinya
 * (h-16), bukan dipecah meniru nama/subteks/trailing. Lihat catatan di
 * kepala file untuk alasannya.
 */
export function KasirRowsSkeleton({
  rows = 5,
  className,
}: {
  rows?: number;
  /** Tata letaknya harus sama dengan daftar aslinya — daftar atau grid. */
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <KasirRowCard key={i}>
          <Skeleton className="h-16 w-full rounded-[var(--shape-panel)]" />
        </KasirRowCard>
      ))}
    </div>
  );
}