'use client';

// ============================================================================
// KATALOG CARD — kartu katalog di tab Jual (tampilan grid)
// File: src/components/dashboard/kasir/katalog-card.tsx
//
// Pasangan grid untuk ProductRow / LayananRow, yang keduanya tampilan DAFTAR.
//
// ── KENAPA KASIR BUTUH DUA TAMPILAN ────────────────────────────────────────
//
// Halaman Produk sudah punya sakelar grid ⇄ daftar sejak collection-toolbar
// ada, dan pilihannya diingat per koleksi. Kasir tidak — ia mengunci satu
// bentuk (baris) untuk semua orang.
//
// Padahal justru di kasir bedanya paling terasa, dan arahnya berlawanan
// per jenis toko:
//
//   Warung/toko baju  → produknya DIKENALI DARI FOTO. Baris teks memaksa
//                       kasir membaca nama satu per satu di depan antrean.
//   Jasa/laundry      → "Cuci Kering Reguler" vs "Cuci Kering Ekspres" cuma
//                       beda satu kata dan fotonya sama saja. Di sini baris
//                       teks yang lebih cepat.
//
// Jadi sakelarnya bukan pemanis: ia yang menentukan berapa lama satu
// transaksi selesai, dan jawabannya beda per toko.
//
// ── BEDA DENGAN KARTU DI HALAMAN PRODUK ────────────────────────────────────
//
// ProductGridCard membuka drawer pratinjau berisi Ubah / Hapus / Aktifkan.
// Kartu INI tidak punya satu pun dari ketiganya, dan itu batas yang disengaja
// sama seperti kenapa "Menu" tidak ada di sub-nav kasir: layar ini dipakai
// SAAT BERJUALAN. Satu-satunya yang boleh terjadi di sini adalah menambah
// dan mengurangi. Menghapus produk dari layar yang dipakai dengan pelanggan
// menunggu di depan meja adalah cara paling cepat kehilangan data.
//
// ── PERILAKU TAP: SAMA PERSIS DENGAN BARIS ─────────────────────────────────
//
//   Belum di keranjang → SELURUH kartu adalah tombol tambah (satu tap).
//   Sudah di keranjang → kaki kartu jadi stepper, dan kartunya TIDAK bisa
//                        ditap lagi. Tanpa aturan kedua, tap di foto akan
//                        menambah qty tanpa disadari kasir.
// ============================================================================

import { Plus } from 'lucide-react';

import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/shared/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPriceIDR } from '@/lib/shared/format';
import { KasirRowCard } from './kasir-row-card';
import { QtyStepper } from './qty-stepper';

interface KatalogCardProps {
  name: string;
  price: number;
  imageUrl: string | null;
  category: string | null;
  /** Lencana di atas nama — stok untuk barang, durasi untuk layanan. */
  badges?: React.ReactNode;
  /** Ikon pengganti saat tidak ada foto. Barang dan layanan memakai ikon beda. */
  fallbackIcon: React.ReactNode;
  qtyDiKeranjang: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  addLabel: string;
}

export function KatalogCard({
  name,
  price,
  imageUrl,
  category,
  badges,
  fallbackIcon,
  qtyDiKeranjang,
  onAdd,
  onIncrement,
  onDecrement,
  addLabel,
}: KatalogCardProps) {
  const adaDiKeranjang = qtyDiKeranjang > 0;

  const gambar = (
    <div className="relative aspect-square overflow-hidden bg-muted">
      {imageUrl ? (
        <OptimizedImage
          src={imageUrl}
          alt={name}
          fill
          crop="fill"
          gravity="auto"
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 16vw"
          className="object-cover"
          fallback={
            <div className="flex h-full items-center justify-center text-muted-foreground/30">
              {fallbackIcon}
            </div>
          }
        />
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground/30">
          {fallbackIcon}
        </div>
      )}
    </div>
  );

  const badan = (
    <div className="px-3 py-2.5 text-left">
      {(badges || category) && (
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          {badges}
          {category && (
            <span className="truncate text-xs leading-none text-muted-foreground">
              {category}
            </span>
          )}
        </div>
      )}

      {/* `min-h` mengunci tinggi dua baris. Tanpa itu kartu bernama pendek
          jadi lebih pendek dari tetangganya, dan barisnya bergerigi. */}
      <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug">
        {name}
      </h3>

      <span className="mt-2 block text-sm font-semibold tabular-nums text-ink">
        {formatPriceIDR(price)}
      </span>
    </div>
  );

  // ── Sudah di keranjang ──────────────────────────────────────────────────
  // Kartunya pasif; yang bisa disentuh cuma stepper di kaki.
  if (adaDiKeranjang) {
    return (
      <KasirRowCard selected className="flex flex-col">
        {gambar}
        {badan}
        <div className="mt-auto flex items-center justify-center border-t bg-surface-sunken px-3 py-2">
          <QtyStepper
            qty={qtyDiKeranjang}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            size="sm"
          />
        </div>
      </KasirRowCard>
    );
  }

  // ── Belum di keranjang ──────────────────────────────────────────────────
  return (
    <KasirRowCard className="flex flex-col">
      <button
        type="button"
        onClick={onAdd}
        aria-label={addLabel}
        className="flex flex-1 flex-col text-left outline-none transition-colors hover:bg-accent/40 active:bg-accent/60"
      >
        {gambar}
        {badan}
        <span className="mt-auto flex items-center justify-center gap-1.5 border-t bg-surface-sunken px-3 py-2 text-caption font-medium text-primary">
          <Plus className="size-3.5" aria-hidden />
          {addLabel}
        </span>
      </button>
    </KasirRowCard>
  );
}

// ── Skeleton ────────────────────────────────────────────────────────────────
// Bentuknya menirukan kartu di atas supaya pergantian memuat → data tidak
// menggeser satu piksel pun.

export function KatalogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--shape-panel)] border bg-card">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 px-3 py-2.5">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/5" />
      </div>
      <div className="border-t px-3 py-2">
        <Skeleton className="h-5 w-full" />
      </div>
    </div>
  );
}

export function KatalogCardsSkeleton({
  count = 10,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      {Array.from({ length: count }).map((_, i) => (
        <KatalogCardSkeleton key={i} />
      ))}
    </div>
  );
}
