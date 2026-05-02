'use client';

// ==========================================
// PRODUCT CARD — Public Store
// Adaptive: Digital (fileKey != null) vs Custom/Service (fileKey == null)
//
// [IDR MIGRATION — May 2026]
// Removed `(isDigital ? 'USD' : 'IDR')` ternary.
// Post-migration uniform default IDR — see product-info.tsx for rationale.
// `isDigital` is still used for icon/badge logic (FileText vs Package).
// ==========================================

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('store.product.badge');
  const tInfo = useTranslations('store.product.info');
  const tCommon = useTranslations('common.productType');
  const { hasDiscount, discountPercent, isCustomPrice } = getProductPricing(product);

  // ── Adaptive: detect product type from fileKey ─────────────────
  // fileKey != null → Digital → Stripe checkout
  // fileKey == null → Custom/Service → WA order
  const isDigital = !!product.fileKey;

  // [IDR MIGRATION] Default to IDR uniformly. Was: ternary digital→USD.
  const currency = product.currency ?? 'IDR';

  // Use the first thumbnail from the images array
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

          {/* Badge: Discount */}
          {hasDiscount && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                {tInfo('discountBadge', { percent: discountPercent })}
              </Badge>
            </div>
          )}

          {/* Badge: Product type (top right) */}
          <div className="absolute top-2 right-2">
            {isDigital ? (
              <Badge className="text-[10px] px-1.5 py-0 bg-blue-600 hover:bg-blue-600 text-white">
                {t('digital')}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-background/80">
                {t('custom')}
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
              {tCommon('contactSeller')}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
