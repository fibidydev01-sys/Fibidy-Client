// ==========================================
// PRODUCT INFO
// Fix: pass currency to formatPrice
// Digital → USD, Custom/Service → IDR or based on product.currency
// ==========================================

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/shared/format';
import { getProductPricing } from '@/lib/shared/product-utils';
import type { Product } from '@/types/product';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { isCustomPrice, hasDiscount, discountPercent } = getProductPricing(product);

  // Resolve currency:
  //   Digital (fileKey != null) → use product.currency (always 'USD' from BE)
  //   Custom/Service (fileKey == null) → fallback 'IDR'
  const isDigital = !!product.fileKey;
  const currency = product.currency ?? (isDigital ? 'USD' : 'IDR');

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
              <Badge variant="destructive">-{discountPercent}%</Badge>
            </>
          )}
        </div>
      )}

      {isCustomPrice && (
        <p className="text-lg text-muted-foreground italic">
          Price: Contact seller
        </p>
      )}

      <Separator />
    </div>
  );
}