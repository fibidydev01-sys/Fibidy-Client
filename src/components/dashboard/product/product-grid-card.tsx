'use client';

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
// Replaced hardcoded `${(product.price ?? 0).toFixed(2)}` with
// `formatPrice(product.price ?? 0, product.currency ?? 'IDR')`.
// Pre-migration this rendered "$50000.00" — wrong for IDR products.
//
// Also exports ProductGridCardSkeleton for loading states. Imported by
// ./product-grid.tsx as part of <ProductsGridSkeleton />.
// ==========================================

import { OptimizedImage } from '@/components/ui/optimized-image';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, FileText } from 'lucide-react';
import { formatPrice } from '@/lib/shared/format';
import type { Product } from '@/types/product';

interface ProductGridCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function ProductGridCard({ product, onClick }: ProductGridCardProps) {
  const imageUrl = product.images?.[0] ?? null;
  const isDigital = !!product.fileKey;
  const isCustomPrice = product.price === 0;

  // [IDR MIGRATION] Default to IDR uniformly. Was: hardcoded $X.XX.
  const currency = product.currency ?? 'IDR';

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
                {isDigital ? (
                  <FileText className="h-10 w-10 text-muted-foreground/30" />
                ) : (
                  <Package className="h-10 w-10 text-muted-foreground/30" />
                )}
              </div>
            }
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {isDigital ? (
              <FileText className="h-10 w-10 text-muted-foreground/30" />
            ) : (
              <Package className="h-10 w-10 text-muted-foreground/30" />
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2.5">
        {product.category && (
          <p className="text-xs text-muted-foreground truncate leading-none mb-1">
            {product.category}
          </p>
        )}
        <h3 className="font-medium text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="mt-2">
          {!isCustomPrice ? (
            <span className="font-semibold text-sm text-primary">
              {/* [IDR MIGRATION] formatPrice respects currency, defaults IDR. */}
              {formatPrice(product.price ?? 0, currency)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">—</span>
          )}
        </div>
      </div>
    </button>
  );
}

// ==========================================
// SKELETON
//
// Imported by ./product-grid.tsx for <ProductsGridSkeleton count={n} />.
// Mirrors the card shape so loading state doesn't shift layout.
// ==========================================

export function ProductGridCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="px-3 py-2.5 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-1/3 mt-2" />
      </div>
    </div>
  );
}
