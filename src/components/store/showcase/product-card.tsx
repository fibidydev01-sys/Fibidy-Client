'use client';

// ==========================================
// PRODUCT CARD — Public Store
// Adaptive: Digital (fileKey != null) vs Custom/Jasa (fileKey == null)
// ==========================================

import { useMemo } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import Link from 'next/link';
import { Package, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/shared/format';
import { productUrl } from '@/lib/public/store-url';
import { getProductPricing } from '@/lib/shared/product-utils';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  storeSlug: string;
}

export function ProductCard({ product, storeSlug }: ProductCardProps) {
  const { hasDiscount, discountPercent, isCustomPrice } = getProductPricing(product);

  // ── Adaptive: detect tipe produk dari fileKey ──────────────────
  // fileKey != null → Digital → Stripe checkout
  // fileKey == null → Custom/Jasa → WA order
  const isDigital = !!product.fileKey;
  const currency = product.currency ?? (isDigital ? 'USD' : 'IDR');

  // Gunakan thumbnail pertama dari images array
  const imageUrl = product.images?.[0] ?? null;
  const url = useMemo(() => productUrl(storeSlug, product.id), [storeSlug, product.id]);

  return (
    <div className="group overflow-hidden transition-shadow hover:shadow-md rounded-xl border border-border/50 bg-card h-full flex flex-col">
      <Link href={url} className="flex flex-col flex-1">

        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl ? (
            <OptimizedImage
              src={imageUrl}
              alt={product.name}
              fill
              crop="fill"
              gravity="auto"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform group-hover:scale-105"
              fallback={
                <div className="flex h-full items-center justify-center">
                  {isDigital
                    ? <FileText className="h-10 w-10 text-muted-foreground/30" />
                    : <Package className="h-10 w-10 text-muted-foreground/30" />
                  }
                </div>
              }
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              {isDigital
                ? <FileText className="h-10 w-10 text-muted-foreground/30" />
                : <Package className="h-10 w-10 text-muted-foreground/30" />
              }
            </div>
          )}

          {/* Badge: Diskon */}
          {hasDiscount && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                -{discountPercent}%
              </Badge>
            </div>
          )}

          {/* Badge: Tipe produk (top right) */}
          <div className="absolute top-2 right-2">
            {isDigital ? (
              <Badge className="text-[10px] px-1.5 py-0 bg-blue-600 hover:bg-blue-600 text-white">
                Digital
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-background/80">
                Custom
              </Badge>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2.5 flex-1">
          {product.category && (
            <p className="text-xs text-muted-foreground truncate leading-none mb-1">
              {product.category}
            </p>
          )}
          <h3 className="font-medium text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {!isCustomPrice && (
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="font-semibold text-sm text-primary">
                {formatPrice(product.price, currency)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.comparePrice!, currency)}
                </span>
              )}
            </div>
          )}

          {isCustomPrice && (
            <p className="mt-1.5 text-xs text-muted-foreground italic">
              Hubungi seller
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}