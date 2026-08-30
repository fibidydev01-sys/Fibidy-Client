'use client';

import { useTranslations } from 'next-intl';

// ==========================================
// PRODUCT GRID CARD — Dashboard product list
// File: src/components/dashboard/product/product-grid-card.tsx
//
// Consumer: ./product-grid.tsx
//   <ProductGridCard product={product} onClick={handleProductClick} />
//
// The card is a clickable summary tile. Edit / Delete / Toggle Active
// are NOT triggered from the card — those live in ProductPreviewDrawer
// which opens on card click. Keep this component dumb-presentational.
//
// [IDR MIGRATION — May 2026]
// Harga dirender lewat formatPriceIDR(), bukan `.toFixed(2)`.
// Sebelum migrasi ini merender "$50000.00" — salah untuk produk IDR.
//
// Also exports ProductGridCardSkeleton for loading states. Imported by
// ./product-grid.tsx as part of <ProductsGridSkeleton />.
//
// [SKELETON SIMPLIFIKASI — Agu 2026]
// ProductGridCardSkeleton sebelumnya menggambar 5 block terpisah (gambar +
// kategori + 2 baris nama + harga) meniru struktur kartu asli persis.
// Diubah jadi SATU block polos seukuran kartu. Skeleton yang meniru detail
// menambah biaya perawatan — setiap kali tata letak kartu berubah, skeleton
// harus ikut diubah supaya tidak "meleset" dari bentuk aslinya — tanpa
// menambah kejelasan buat pengguna dibanding satu block generik.
// ==========================================

import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/shared/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Wrench } from 'lucide-react';
import { formatPriceIDR } from '@/lib/shared/format';
import type { Product } from '@/types/product';

interface ProductGridCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function ProductGridCard({ product, onClick }: ProductGridCardProps) {
  const tKind = useTranslations('dashboard.products.kind');
  const tCol = useTranslations('dashboard.products.collection');
  const imageUrl = product.images?.[0] ?? null;
  const isCustomPrice = product.price === 0;
  // [KASIR JASA] Barang dan layanan tampil di daftar yang sama, jadi
  // pembedanya harus terbaca dari kartu — tanpa itu seller tidak bisa tahu
  // kenapa satu entri punya stok dan yang lain tidak.
  const isJasa = product.kind === 'JASA';

  // [IDR MIGRATION] Default to IDR uniformly. Was: hardcoded $X.XX.

  return (
    <button
      type="button"
      onClick={() => onClick(product)}
      className="group block w-full text-left rounded-xl border border-border/50 bg-card overflow-hidden transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imageUrl ? (
          <OptimizedImage
            src={imageUrl}
            alt={product.name}
            fill
            crop="fill"
            gravity="auto"
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
            fallback={
              <div className="flex h-full items-center justify-center">
                <Package className="h-10 w-10 text-muted-foreground/30" />
              </div>
            }
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2.5">
        <div className="mb-1 flex items-center gap-1.5">
          {isJasa && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
              <Wrench className="h-2.5 w-2.5" aria-hidden />
              {tKind('jasa')}
            </span>
          )}
          {product.category && (
            <p className="truncate text-xs leading-none text-muted-foreground">
              {product.category}
            </p>
          )}
        </div>
        <h3 className="font-medium text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="mt-2">
          {!isCustomPrice ? (
            <span className="font-semibold text-sm text-ink">
              {formatPriceIDR(product.price ?? 0)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">—</span>
          )}
        </div>
      </div>

      {/* Strip meta di kaki kartu — pola yang sama dengan kartu proyek EAS,
          yang menaruh status build di bilah terpisah di bawah namanya.
          Statusnya tidak bisa ikut ke badan kartu: badan sudah memuat
          kategori, nama dua baris, dan harga, dan menambah baris keempat di
          sana membuat tinggi kartu bergantung pada panjang nama produk. */}
      <div className="flex items-center gap-1.5 border-t bg-surface-sunken px-3 py-2">
        <span
          aria-hidden
          className={cn(
            'size-1.5 shrink-0 rounded-full',
            product.isActive ? 'bg-semantic-success' : 'bg-muted-strong',
          )}
        />
        <span className="truncate text-caption text-muted-foreground">
          {tCol(product.isActive ? 'statusActive' : 'statusInactive')}
        </span>
      </div>
    </button>
  );
}

// ==========================================
// SKELETON
//
// Imported by ./product-grid.tsx for <ProductsGridSkeleton count={n} />.
//
// SATU block polos, tanpa border, radius mengikuti radius kartu asli
// (rounded-xl). Lihat catatan simplifikasi di kepala file.
// ==========================================

export function ProductGridCardSkeleton() {
  return (
    <div className="aspect-square w-full overflow-hidden rounded-xl bg-card">
      <Skeleton className="h-full w-full rounded-xl" />
    </div>
  );
}