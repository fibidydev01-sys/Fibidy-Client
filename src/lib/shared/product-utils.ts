// ============================================================================
// FILE: src/lib/shared/product-utils.ts
// PURPOSE: Shared product logic — pricing, display helpers
// ============================================================================

import type { Product } from '@/types/product';

// ==========================================
// PRICING
// Dipakai di: ProductCard, ProductInfo, ProductPreviewDrawer, OgImage
// ==========================================

interface ProductPricing {
  isCustomPrice: boolean;
  hasDiscount: boolean;
  discountPercent: number;
}

export function getProductPricing(product: Pick<Product, 'price' | 'comparePrice'>): ProductPricing {
  const isCustomPrice = product.price === 0;
  const hasDiscount =
    !isCustomPrice &&
    !!product.comparePrice &&
    product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
      ((product.comparePrice! - product.price) / product.comparePrice!) * 100
    )
    : 0;

  return { isCustomPrice, hasDiscount, discountPercent };
}

// ==========================================
// SHOW PRICE
// Derive showPrice dari metadata produk
// Dipakai di: ProductForm
// ==========================================

export function getShowPrice(product?: Pick<Product, 'metadata'>): boolean {
  const meta = product?.metadata as Record<string, unknown> | null | undefined;
  if (meta?.showPrice === false) return false;
  return true;
}

// ==========================================
// MAX IMAGES
// Business logic limit foto per plan
// STARTER = 3, BUSINESS = 5
// Dipakai di: ProductForm, StepMedia
// ==========================================

export function getMaxImages(isBusiness: boolean): number {
  return isBusiness ? 5 : 3;
}