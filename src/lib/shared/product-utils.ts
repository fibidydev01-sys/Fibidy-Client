// ============================================================================
// FILE: src/lib/shared/product-utils.ts
// PURPOSE: Shared product logic — pricing, display helpers
// 3-tier image limits (FREE/STARTER/BUSINESS)
// ============================================================================

import type { Product } from '@/types/product';
import type { SubscriptionTier } from '@/lib/api/subscription';

// ==========================================
// DIGITAL CHECK
// ==========================================

export function isDigitalProduct(product: Pick<Product, 'fileKey'>): boolean {
  return !!product.fileKey;
}

// ==========================================
// PRICING
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
// ==========================================

export function getShowPrice(product?: Pick<Product, 'metadata'>): boolean {
  const meta = product?.metadata as Record<string, unknown> | null | undefined;
  if (meta?.showPrice === false) return false;
  return true;
}

// ==========================================
// MAX IMAGES — 3-tier system
//
// FREE:     2 photos per product
// STARTER:  3 photos per product
// BUSINESS: 5 photos per product
// ==========================================

const IMAGE_LIMITS: Record<SubscriptionTier, number> = {
  FREE: 2,
  STARTER: 3,
  BUSINESS: 5,
};

/**
 * Get max images based on subscription tier.
 */
export function getMaxImages(tier: SubscriptionTier): number {
  return IMAGE_LIMITS[tier] ?? IMAGE_LIMITS.FREE;
}
