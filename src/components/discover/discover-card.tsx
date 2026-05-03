'use client';

// ==========================================
// DISCOVER CARD — Marketplace browse view
//
// [IDR MIGRATION — May 2026]
// Replaced hardcoded `${product.price.toFixed(2)}` with
// `formatPrice(product.price, product.currency ?? 'IDR')`. Pre-migration
// this rendered "$50000.00" for IDR products — wrong on every dimension
// (wrong symbol, wrong separator, wrong decimals). Now respects
// `product.currency` if set; defaults to IDR.
//
// [TYPE PARITY FIX — May 2026]
// `DiscoverProduct` is an alias of `PublicProduct`, which exposes
// the seller display name as `sellerName` — NOT `tenantName`. The
// previous build referenced `product.tenantName` and would silently
// render an empty seller line. Now uses `sellerName` so the "by {name}"
// row actually fills in.
// ==========================================

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { formatPrice } from '@/lib/shared/format';
import type { DiscoverProduct } from '@/types/discover';

interface DiscoverCardProps {
  product: DiscoverProduct;
}

export function DiscoverCard({ product }: DiscoverCardProps) {
  const t = useTranslations('discover.card');

  const imageUrl = product.images?.[0] ?? null;
  // [IDR MIGRATION] Default to IDR. Was: hardcoded $X.XX.
  const currency = product.currency ?? 'IDR';

  return (
    <Link href={`/discover/${product.id}`}>
      <Card className="group overflow-hidden h-full flex flex-col transition-shadow hover:shadow-md">
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
                  <FileText className="h-10 w-10 text-muted-foreground/30" />
                </div>
              }
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FileText className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}

          {/* Digital badge */}
          <div className="absolute top-2 right-2">
            <Badge className="text-[10px] px-1.5 py-0 bg-blue-600 hover:bg-blue-600 text-white">
              {t('digitalBadge')}
            </Badge>
          </div>
        </div>

        {/* Body */}
        <div className="px-3 py-2.5 flex-1 flex flex-col">
          {product.category && (
            <p className="text-xs text-muted-foreground truncate leading-none mb-1">
              {product.category}
            </p>
          )}
          <h3 className="font-medium text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Seller — denormalized from public discover payload */}
          {product.sellerName && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {t('bySeller', { name: product.sellerName })}
            </p>
          )}

          {/* Price */}
          <div className="mt-auto pt-2">
            <span className="font-semibold text-sm text-primary">
              {formatPrice(product.price, currency)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
