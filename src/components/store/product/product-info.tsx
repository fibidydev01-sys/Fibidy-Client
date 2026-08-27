// ==========================================
// PRODUCT INFO
//
// [IDR MIGRATION — May 2026]
// Removed `(isDigital ? 'USD' : 'IDR')` ternary.
// Post-migration, ALL Stripe Connect transactions (including digital
// products) settle in IDR. Custom/service products are also IDR.
// Subscription billing is the only USD path — that's LemonSqueezy
// and doesn't touch this component.
// Default fallback is now 'IDR' uniformly.
// ==========================================

import { useTranslations } from 'next-intl';
import { Clock, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPriceIDR } from '@/lib/shared/format';
import { getProductPricing, formatDurasiLayanan } from '@/lib/shared/product-utils';
import type { Product } from '@/types/product';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const t = useTranslations('store.product.info');
  const { isCustomPrice, hasDiscount, discountPercent } = getProductPricing(product);

  // [IDR MIGRATION] Default to IDR uniformly. Was: ternary digital→USD.

  // [KASIR JASA] Layanan dan barang tampil di etalase yang sama. Tanpa
  // penanda, "Cuci Setrika Kilat — Rp 15.000" terbaca sebagai barang yang
  // bisa dibungkus dan dibawa pulang, dan pertanyaan pertama pelanggan
  // ("jadinya kapan?") tidak terjawab di halaman ini.
  const isJasa = product.kind === 'JASA';
  const durasi = formatDurasiLayanan(product.durasiJam);

  return (
    <div className="space-y-4">
      {/* Category */}
      {product.category && (
        <p className="text-sm text-muted-foreground">{product.category}</p>
      )}

      {/* Product name */}
      <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>

      {/* [KASIR JASA] Jenis + estimasi pengerjaan */}
      {isJasa && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Wrench className="h-3 w-3" aria-hidden />
            {t('jasaBadge')}
          </Badge>
          {product.durasiLabel && (
            <Badge variant="outline">{product.durasiLabel}</Badge>
          )}
          {durasi && (
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {t(durasi.satuan === 'hari' ? 'estimasiHari' : 'estimasiJam', {
                nilai: durasi.nilai,
              })}
            </span>
          )}
        </div>
      )}

      {/* Price */}
      {!isCustomPrice && (
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">
            {formatPriceIDR(product.price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {formatPriceIDR(product.comparePrice!)}
              </span>
              <Badge variant="destructive">{t('discountBadge', { percent: discountPercent })}</Badge>
            </>
          )}
        </div>
      )}

      {isCustomPrice && (
        <p className="text-lg text-muted-foreground italic">
          {t('priceContactSeller')}
        </p>
      )}

      <Separator />
    </div>
  );
}
