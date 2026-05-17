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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/shared/format';
import { getProductPricing } from '@/lib/shared/product-utils';
import type { Product } from '@/types/product';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const t = useTranslations('store.product.info');
  const { isCustomPrice, hasDiscount, discountPercent } = getProductPricing(product);

  // [IDR MIGRATION] Default to IDR uniformly. Was: ternary digital→USD.
  const currency = product.currency ?? 'IDR';

  return (
    <div className="space-y-4">
      {/* Category */}
      {product.category && (
        <p className="text-sm text-muted-foreground">{product.category}</p>
      )}

      {/* Product name */}
      <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>

      {/* Price */}
      {!isCustomPrice && (
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">
            {formatPrice(product.price, currency)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.comparePrice!, currency)}
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
