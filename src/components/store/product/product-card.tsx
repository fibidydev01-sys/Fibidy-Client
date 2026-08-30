'use client';

// ==========================================
// PRODUCT CARD — Public Store
//
// [IDR MIGRATION — May 2026]
// Uniform default IDR — see product-info.tsx for rationale.
//
// [UI/UX — Aug 2026] Badge tipe produk dihapus; satu-satunya badge di sini
// adalah diskon.
// ==========================================

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Package, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPriceIDR } from '@/lib/shared/format';
import { productUrl } from '@/lib/public/store-url';
import {
  getProductPricing,
  formatDurasiLayanan,
} from '@/lib/shared/product-utils';
import type { Product } from '@/types/product';
import { Link } from '@/i18n/navigation';

interface ProductCardProps {
  product: Product;
  storeSlug: string;
}

export function ProductCard({ product, storeSlug }: ProductCardProps) {
  const tInfo = useTranslations('store.product.info');
  const tCommon = useTranslations('common.productType');
  const { hasDiscount, discountPercent, isCustomPrice } = getProductPricing(product);

  // [IDR MIGRATION] Default to IDR uniformly.
  const durasi = formatDurasiLayanan(product.durasiJam);

  // Use the first thumbnail from the images array
  const imageUrl = product.images?.[0] ?? null;
  const url = useMemo(() => productUrl(storeSlug, product.id), [storeSlug, product.id]);

  return (
    <div className="group overflow-hidden transition-shadow hover:shadow-md rounded-[var(--shape-panel)] border border-border/50 bg-card h-full flex flex-col">
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
                  <Package className="h-10 w-10 text-muted-foreground/30" />
                </div>
              }
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}

          {/* Badge: Discount — the only badge a buyer needs here */}
          {hasDiscount && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                {tInfo('discountBadge', { percent: discountPercent })}
              </Badge>
            </div>
          )}
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

          {/* [KASIR JASA] Satu baris estimasi, bukan badge di atas gambar.
              Di grid etalase, yang dicari pembeli adalah harga dan "berapa
              lama" — bukan label jenis. Barang tidak mendapat baris ini sama
              sekali, jadi tinggi kartunya tidak berubah untuk toko produk. */}
          {product.kind === 'JASA' && (durasi || product.durasiLabel) && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0" aria-hidden />
              <span className="truncate">
                {durasi
                  ? tInfo(
                    durasi.satuan === 'hari' ? 'estimasiHari' : 'estimasiJam',
                    { nilai: durasi.nilai },
                  )
                  : product.durasiLabel}
              </span>
            </p>
          )}

          {!isCustomPrice && (
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="font-semibold text-sm text-primary">
                {formatPriceIDR(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPriceIDR(product.comparePrice!)}
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
