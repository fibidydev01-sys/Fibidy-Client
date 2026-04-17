'use client';

import Image from 'next/image';
import { Package, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types/product';

// ==========================================
// SKELETON
// ==========================================

export function ProductGridCardSkeleton() {
  return (
    <div className="group">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="mt-2 space-y-1">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

// ==========================================
// PRODUCT GRID CARD — v3 unified
//
// Thumbnail priority (semua tipe produk sama):
//   1. images[0]  → cover image yang diupload user (utama)
//   2. Fallback icon → FileText (digital) atau Package (custom/jasa)
//
// Fix: digital product (fileKey != null) tetap pakai images[0]
//      bukan langsung fallback ke icon FileText
// ==========================================

interface ProductGridCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function ProductGridCard({ product, onClick }: ProductGridCardProps) {
  // Selalu cek images[0] dulu — berlaku untuk semua tipe produk
  const imageUrl = product.images?.[0] ?? null;
  const isDigital = !!product.fileKey;
  const salesCount = product._count?.purchases ?? 0;

  return (
    <button
      onClick={() => onClick(product)}
      className="group block w-full text-left"
    >
      {/* Thumbnail */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted">
        {imageUrl ? (
          // ── Ada cover image → tampil untuk semua tipe produk ──
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-150 group-hover:scale-105"
          />
        ) : (
          // ── Tidak ada cover image → fallback icon ──────────────
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted gap-1">
            {isDigital ? (
              <>
                <FileText className="h-10 w-10 text-muted-foreground/40" />
                <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase">
                  {product.fileType ?? 'FILE'}
                </span>
              </>
            ) : (
              <Package className="h-12 w-12 text-muted-foreground/40" />
            )}
          </div>
        )}

        {/* Badge: Draft */}
        {!product.isActive && (
          <div className="absolute top-2 left-2">
            <span className="bg-yellow-500/90 text-white text-xs px-2 py-0.5 rounded">
              Draft
            </span>
          </div>
        )}

        {/* Badge: File type — hanya kalau digital DAN tidak ada cover image */}
        {isDigital && product.fileType && !imageUrl && (
          <div className="absolute top-2 right-2">
            <span className="bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase">
              {product.fileType}
            </span>
          </div>
        )}

        {/* Badge: File type — kalau ada cover image, tetap tampil tapi lebih subtle */}
        {isDigital && product.fileType && imageUrl && (
          <div className="absolute top-2 right-2">
            <span className="bg-black/50 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase">
              {product.fileType}
            </span>
          </div>
        )}
      </div>

      {/* Info below card */}
      <div className="mt-2 px-0.5">
        <p className="text-sm font-medium truncate">{product.name}</p>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs font-semibold text-primary">
            ${(product.price ?? 0).toFixed(2)}
          </span>
          {salesCount > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {salesCount} sold
            </span>
          )}
        </div>
      </div>
    </button>
  );
}