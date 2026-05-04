// ==========================================
// STORE BUILDER DATA
// File: src/lib/data/marketing/store-builder.ts
//
// Phase 3 (Interactive Store Builder, May 2026):
//
// 6 specific categories shown in the marketing builder, mapped to
// real category keys in lib/constants/shared/categories.ts.
//
// Q5 = C decision: specific labels (not broad groups). Easier mental
// model for visitors, clean auto-skip in register (the slug they pick
// here goes straight to step 4 with the correct subcat already set).
//
// Why these 6:
//   - RESTAURANT          → broadest food category; covers cafes, warungs
//   - FASHION_APPAREL     → highest IG-driven UMKM segment
//   - HAIR_SALON          → represents service-based businesses
//   - CLEANING_SERVICE    → home-services anchor
//   - GROCERY_CONVENIENCE → traditional retail anchor
//   - 'other' (null key)  → escape hatch; opens register at step 2
//
// Copy lives at `marketing.storeBuilder.categories.{id}` in marketing.json.
// Icon + categoryKey are non-translatable, so they live here.
//
// [PHASE 4 — May 2026, Q17 SoT]
// Categories are now VALIDATED at module-load time against the central
// `categories.ts` registry. Any `categoryKey` that doesn't resolve via
// `getCategoryConfig()` causes the module to throw on import — catching
// drift the moment it lands rather than at user-facing checkpoints
// (auto-skip step 3 in register, etc.).
//
// This is the single-source-of-truth wiring promised in HANDOFF Q17:
// marketing curates a SUBSET (6 keys + curated icons + curated marketing
// labels), but the keys themselves MUST exist in the auth/register
// category registry. If you add a marketing key that's missing from
// categories.ts, `npm run build` fails — by design.
// ==========================================

import {
  UtensilsCrossed,
  Shirt,
  Scissors,
  Sparkles,
  ShoppingBasket,
  MoreHorizontal,
} from 'lucide-react';
import type { BuilderCategoryData } from '@/types/marketing';
import { getCategoryConfig } from '@/lib/constants/shared/categories';

const builderCategoriesRaw: BuilderCategoryData[] = [
  {
    id: 'restaurant',
    icon: UtensilsCrossed,
    categoryKey: 'RESTAURANT',
  },
  {
    id: 'fashion',
    icon: Shirt,
    categoryKey: 'FASHION_APPAREL',
  },
  {
    id: 'beautySalon',
    icon: Scissors,
    categoryKey: 'HAIR_SALON',
  },
  {
    id: 'cleaning',
    icon: Sparkles,
    categoryKey: 'CLEANING_SERVICE',
  },
  {
    id: 'retail',
    icon: ShoppingBasket,
    categoryKey: 'GROCERY_CONVENIENCE',
  },
  {
    id: 'other',
    icon: MoreHorizontal,
    categoryKey: null, // ← register lands at step 2 (Category) instead of skipping
  },
];

// ──────────────────────────────────────────────────────────────────
// [Q17 SoT GUARD]
// Validate each entry's `categoryKey` resolves to a real registry
// entry in `lib/constants/shared/categories.ts`. Runs once at module
// load — server side at boot, client side at hydrate. A missing key
// is a build/typecheck-blocking drift bug, not a runtime issue, so
// we throw immediately rather than silently degrade.
//
// `null` is the explicit "Other..." escape hatch — register lands on
// step 2 instead of skipping, so no key resolution is required.
// ──────────────────────────────────────────────────────────────────
for (const entry of builderCategoriesRaw) {
  if (entry.categoryKey === null) continue;

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
