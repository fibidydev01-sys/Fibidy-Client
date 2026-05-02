'use client';

// ==========================================
// DISCOVER DETAIL — Product info section
// File: src/components/discover/discover-detail.tsx
//
// Renders ONLY the product info (name, price, description, seller link,
// page count badge for digital products). The parent client.tsx
// (discover/[id]/client.tsx) is responsible for:
//   - PdfPreview section above
//   - BuyButton + ContactSellerButton below
//   - Policy notice
//
// Props are NOT optional — the consumer always provides both.
// `pageCount` is null when preview hasn't loaded or product has no pages.
//
// [IDR MIGRATION — May 2026]
// Uses formatPrice with `product.currency ?? 'IDR'` fallback. Removes any
// hardcoded `$X.XX` / `toFixed(2)` patterns. Currency display fully respects
// product.currency if set; defaults to IDR consistent with platform.
//
// NOTE on i18n:
// This rebuilt component uses inline strings for the tiny static labels
// (`pages`, `by {name}`, `About this product`). If you previously had
// these under `discover.detail.{bySeller, descriptionHeading,
// pageCountBadge}` and want to restore i18n, add useTranslations and swap
// the literals. Build is the priority right now.
// ==========================================

import Link from 'next/link';
import { Store, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/shared/format';
import type { PublicProduct } from '@/types/product';

interface DiscoverDetailProps {
  product: PublicProduct;
  pageCount: number | null;
}

export function DiscoverDetail({ product, pageCount }: DiscoverDetailProps) {
  // [IDR MIGRATION] Default to IDR uniformly. Was: hardcoded $X.XX / USD ternary.
  const currency = product.currency ?? 'IDR';
  const formattedPrice = formatPrice(product.price, currency);
  const formattedCompare = product.comparePrice
    ? formatPrice(product.comparePrice, currency)
    : null;

  return (
    <section className="space-y-4">
      {/* Category */}
      {product.category && (
        <p className="text-sm text-muted-foreground">{product.category}</p>
      )}

      {/* Name */}
      <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>

      {/* Price + page count badge */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-3xl font-bold text-primary">{formattedPrice}</span>
        {formattedCompare && (
          <span className="text-lg text-muted-foreground line-through">
            {formattedCompare}
          </span>
        )}
        {pageCount !== null && pageCount > 0 && (
          <Badge variant="outline" className="ml-1">
            <FileText className="h-3 w-3 mr-1" />
            {pageCount} pages
          </Badge>
        )}
      </div>

      {/* Seller link — graceful: only render if seller info available */}
      {product.sellerName && (
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Store className="h-4 w-4" />
          <span>by {product.sellerName}</span>
        </div>
      )}

      <Separator />

      {/* Description */}
      {product.description && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">About this product</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}
    </section>
  );
}
