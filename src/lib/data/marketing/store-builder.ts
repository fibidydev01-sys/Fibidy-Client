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
// CHANGED v15.6 (May 2026 — "Lainnya" escape hatch RESTORED):
//   - REPLACED: 'retail' chip → 'other' chip.
//     Per CEO directive: 6th chip is now "Lainnya" / "Other" — an
//     escape hatch for visitors whose business doesn't fit the 5
//     primary verticals. Tapping it bypasses the builder entirely
//     and routes the user straight to /register (handled in
//     store-builder-section.tsx).
//   - The 'other' entry carries `isOther: true` flag so the section
//     handler can detect it without string-matching on `id`.
//   - `categoryKey` + `visualKey` are kept as `'GROCERY_CONVENIENCE'`
//     and `'retail'` respectively — they're load-bearing for the
//     Q17 SoT guard below AND for the type system (`BuilderVisualKey`
//     union). Neither value is ever consumed at runtime for the
//     'other' chip because the section handler intercepts the
//     click before slug-claim / preview render. Treat them as
//     "type-system noise" for this single entry.
//
// PREVIOUS CHANGED notes (preserved for context):
//   - DROPPED: 'other' chip with categoryKey: null escape hatch.
//     [v15.6: undone — see above]
//   - ADDED: 'coffeeshop' chip mapping to existing CAFE registry key.
//   - REVISION: every entry now carries `bannerImage` (Unsplash URL)
//     instead of gradient + accent icon.
//   - bannerEyebrowKey + bannerTaglineKey point at i18n keys.
//
// Final 6 chips (v15.6):
//   - RESTAURANT          → broadest food category
//   - CAFE                → coffee shop / cafe / tea house
//   - FASHION_APPAREL     → highest IG-driven UMKM segment
//   - HAIR_SALON          → service-based businesses anchor
//   - CLEANING_SERVICE    → home-services anchor
//   - OTHER               → escape hatch → /register
//
// Copy lives at `marketing.storeBuilder.categoryStep.categories.{id}`
// in marketing.json. Icon + categoryKey + visualKey + bannerImage are
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
  MoreHorizontal,
} from 'lucide-react';
import type {
  BuilderCategoryData,
  BuilderVisualKey,
} from '@/types/marketing';
import { getCategoryConfig } from '@/lib/constants/shared/categories';

// v15.6: BuilderCategoryData augmented with optional `isOther` flag.
// Type lives in @/types/marketing — if TS complains about this prop
// being unknown, ensure the type definition has been updated to
// include `isOther?: boolean`. (See bottom of this file for an
// inline interface extension as a defensive fallback.)
type BuilderCategoryDataExt = BuilderCategoryData & {
  /** True ONLY for the "Lainnya" / "Other" escape-hatch chip.
   *  When set, the section handler intercepts the click and
   *  redirects to /register instead of running normal selection. */
  isOther?: boolean;
};

const builderCategoriesRaw: BuilderCategoryDataExt[] = [
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
    id: 'other',
    icon: MoreHorizontal,
    // categoryKey + visualKey are required by the type system but
    // never consumed for this chip — section handler intercepts
    // the click before any selection state is set. Both fields
    // point at safe, real values to keep the Q17 SoT guard happy.
    categoryKey: 'GROCERY_CONVENIENCE',
    visualKey: 'retail',
    isOther: true,
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

export const builderCategories: readonly BuilderCategoryDataExt[] =
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
// banner becomes a cleaning service. Etc.
//
// v15.6: 'retail' visual entry KEPT here even though no chip uses
// it directly anymore. Reasons:
//   1. The 'other' chip's `visualKey` points at it (defensive — even
//      though the click is intercepted, having the lookup return a
//      valid object prevents crashes if intercept logic ever drifts).
//   2. BuilderVisualKey union still contains 'retail' — removing it
//      would force changes in @/types/marketing as well.
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