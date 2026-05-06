// ==========================================
// STORE BUILDER DATA
// File: src/lib/data/marketing/store-builder.ts
//
// Phase 3 (Interactive Store Builder, May 2026):
//
// Specific categories shown in the marketing builder, mapped to
// real category keys in lib/constants/shared/categories.ts.
//
// Phase 5 (Magic UI polish, May 2026 — CEO unlock, REVISION):
//
// Q5 = C decision RECONFIRMED: specific labels (not broad groups).
//
// CHANGED:
//   - DROPPED: 'other' chip with categoryKey: null escape hatch.
//     Per CEO directive — every chip routes the visitor to a real
//     subcategory. Cleaner mental model + cleaner auto-skip path.
//   - ADDED: 'coffeeshop' chip mapping to existing CAFE registry key.
//     Coffee shop is the highest-volume sub-segment of the food
//     vertical for Indonesian UMKM, deserves first-class real estate.
//   - REVISION: every entry now carries `bannerImage` (Unsplash URL)
//     instead of gradient + accent icon. The builder preview is now a
//     full-bleed e-commerce banner, NOT a stub product grid — so the
//     dynamic-visual contract is "the banner photo follows the
//     category".
//   - bannerEyebrowKey + bannerTaglineKey point at i18n keys so
//     every locale gets natural copy under the banner image.
//
// Final 6 chips:
//   - RESTAURANT          → broadest food category
//   - CAFE                → coffee shop / cafe / tea house
//   - FASHION_APPAREL     → highest IG-driven UMKM segment
//   - HAIR_SALON          → service-based businesses anchor
//   - CLEANING_SERVICE    → home-services anchor
//   - GROCERY_CONVENIENCE → traditional retail anchor
//
// Copy lives at `marketing.storeBuilder.categoryStep.categories.{id}`
// and `marketing.storeBuilder.preview.banners.{visualKey}.*` in
// marketing.json. Icon + categoryKey + visualKey + bannerImage are
// non-translatable, so they live here.
//
// [Q17 SoT] Categories are VALIDATED at module-load time against the
// central `categories.ts` registry. Any `categoryKey` that doesn't
// resolve via `getCategoryConfig()` causes the module to throw on
// import — catching drift the moment it lands.
// ==========================================

import {
  UtensilsCrossed,
  Coffee,
  Shirt,
  Scissors,
  Sparkles,
  ShoppingBasket,
} from 'lucide-react';
import type {
  BuilderCategoryData,
  BuilderVisualKey,
} from '@/types/marketing';
import { getCategoryConfig } from '@/lib/constants/shared/categories';

const builderCategoriesRaw: BuilderCategoryData[] = [
  {
    id: 'restaurant',
    icon: UtensilsCrossed,
    categoryKey: 'RESTAURANT',
    visualKey: 'restaurant',
  },
  {
    id: 'coffeeshop',
    icon: Coffee,
    categoryKey: 'CAFE',
    visualKey: 'coffeeshop',
  },
  {
    id: 'fashion',
    icon: Shirt,
    categoryKey: 'FASHION_APPAREL',
    visualKey: 'fashion',
  },
  {
    id: 'beautySalon',
    icon: Scissors,
    categoryKey: 'HAIR_SALON',
    visualKey: 'beautySalon',
  },
  {
    id: 'cleaning',
    icon: Sparkles,
    categoryKey: 'CLEANING_SERVICE',
    visualKey: 'cleaning',
  },
  {
    id: 'retail',
    icon: ShoppingBasket,
    categoryKey: 'GROCERY_CONVENIENCE',
    visualKey: 'retail',
  },
];

// ──────────────────────────────────────────────────────────────────
// [Q17 SoT GUARD]
// ──────────────────────────────────────────────────────────────────
for (const entry of builderCategoriesRaw) {
  if (!getCategoryConfig(entry.categoryKey)) {
    throw new Error(
      `[marketing/store-builder] categoryKey "${entry.categoryKey}" ` +
        `(builder id "${entry.id}") not found in ` +
        `lib/constants/shared/categories.ts. ` +
        `Marketing category curation must reference real registry keys — ` +
        `update the registry or fix the typo.`,
    );
  }
}

export const builderCategories: readonly BuilderCategoryData[] =
  builderCategoriesRaw;

// ==========================================
// CATEGORY VISUAL TREATMENT MAP
// ==========================================
//
// Each visualKey maps to:
//   - bannerImage: Unsplash photo URL (drives the live preview banner)
//   - bannerEyebrowKey: i18n key under preview.banners.{visualKey}.eyebrow
//   - bannerTaglineKey: i18n key under preview.banners.{visualKey}.tagline
//
// The image is the centerpiece. Visitor picks "Fashion" → preview
// banner becomes a fashion storefront. Picks "Cleaning Service" →
// banner becomes a cleaning service. Etc. This is what a real
// Shopify/Squarespace template demo feels like.
// ==========================================

export interface CategoryVisual {
  /** Unsplash image URL — drives the BuilderPreview banner */
  bannerImage: string;
  /** i18n key for the banner eyebrow (small uppercase label) */
  bannerEyebrowKey: string;
  /** i18n key for the banner tagline (1 sentence under the H4) */
  bannerTaglineKey: string;
}

export const categoryVisuals: Record<BuilderVisualKey, CategoryVisual> = {
  restaurant: {
    bannerImage:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    bannerEyebrowKey: 'banners.restaurant.eyebrow',
    bannerTaglineKey: 'banners.restaurant.tagline',
  },
  coffeeshop: {
    bannerImage:
      'https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=1200&q=80',
    bannerEyebrowKey: 'banners.coffeeshop.eyebrow',
    bannerTaglineKey: 'banners.coffeeshop.tagline',
  },
  fashion: {
    bannerImage:
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1200&q=80',
    bannerEyebrowKey: 'banners.fashion.eyebrow',
    bannerTaglineKey: 'banners.fashion.tagline',
  },
  beautySalon: {
    bannerImage:
      'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1200&q=80',
    bannerEyebrowKey: 'banners.beautySalon.eyebrow',
    bannerTaglineKey: 'banners.beautySalon.tagline',
  },
  cleaning: {
    bannerImage:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    bannerEyebrowKey: 'banners.cleaning.eyebrow',
    bannerTaglineKey: 'banners.cleaning.tagline',
  },
  retail: {
    bannerImage:
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1200&q=80',
    bannerEyebrowKey: 'banners.retail.eyebrow',
    bannerTaglineKey: 'banners.retail.tagline',
  },
};
