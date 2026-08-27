// ============================================================================
// FILE: src/lib/shared/product-utils.ts
// PURPOSE: Shared product logic — pricing, display helpers
// 3-tier image limits (FREE/STARTER/BUSINESS)
// ============================================================================

import type { Product } from '@/types/product';
import type { SubscriptionTier } from '@/lib/api/subscription';

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
// [KASIR JASA] DURASI LAYANAN
// ==========================================

/**
 * "48 jam" jadi "2 hari" — hanya kalau kelipatan hari penuh.
 *
 * "1 hari 6 jam" justru lebih sulit dibaca daripada "30 jam" saat kasir
 * menyebutkannya ke pelanggan, jadi konversinya sengaja tidak dipaksakan.
 *
 * Tinggal di sini, bukan di komponen, karena dipakai tiga tempat: baris
 * layanan di kasir, halaman produk di etalase, dan kartu produk di dashboard.
 * Tiga salinan aturan pembulatan yang sama akan berbeda begitu salah satunya
 * disentuh.
 */
export function formatDurasiLayanan(
  jam: number | null | undefined,
): { nilai: number; satuan: 'jam' | 'hari' } | null {
  if (jam == null || jam <= 0) return null;
  if (jam >= 24 && jam % 24 === 0) return { nilai: jam / 24, satuan: 'hari' };
  return { nilai: jam, satuan: 'jam' };
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
