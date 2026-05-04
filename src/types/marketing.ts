// ==========================================
// MARKETING TYPES
// File: src/types/marketing.ts
//
// Cross-component types for the (marketing) public landing.
// Per HANDOFF §7: only types used in 2+ files live here.
// Types used in a single section + its data file stay inline.
//
// Phase 3 (Interactive Store Builder, May 2026):
//   - SectionKey: 'howItWorks' DROPPED, 'storeBuilder' ADDED
//     (Q6=O1: Builder replaces "How It Works" because the builder
//     IS how it works, more powerfully — visitors try the product
//     before signing up.)
//
// Anything declared here is implicitly part of the marketing
// "contract" — changing a shape affects multiple sections at once,
// so be deliberate.
// ==========================================

import type { LucideIcon } from 'lucide-react';

// ==========================================
// SECTION REGISTRY
// ==========================================
//
// Every renderable section key. The composer at
// src/app/[locale]/(marketing)/page.tsx maps this list to a
// React component via REGISTRY. Adding a new section means:
//   1. Add the key here
//   2. Add the component to REGISTRY in page.tsx
//   3. Decide whether the key belongs in DEFAULT_SECTIONS
//      (lib/data/marketing/sections.ts)
// ==========================================

export type SectionKey =
  | 'announcement'
  | 'hero'
  | 'problem'
  | 'features'
  | 'pricing'
  | 'storeBuilder'
  | 'faq'
  | 'finalCta';

// ==========================================
// FEATURE TILE
// ==========================================
//
// Bento grid uses span hints to drive CSS Grid layout. Three sizes:
//   - 'large'  → 2 cols × 2 rows on desktop (flagship)
//   - 'wide'   → 2 cols × 1 row
//   - 'normal' → 1 col × 1 row
//
// On mobile everything collapses to 1 col regardless of span.
// ==========================================

export type FeatureSpan = 'large' | 'wide' | 'normal';

export interface FeatureTileData {
  /** Stable id, used as i18n key suffix and React key */
  id: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Bento span hint (desktop) */
  span: FeatureSpan;
}

// ==========================================
// PRICING TIER
// ==========================================
//
// Mirrors SubscriptionTier from lib/api/subscription so marketing and
// dashboard stay aligned. Don't import from there to avoid pulling
// the whole API client into marketing — duplicate the literal type
// instead.
// ==========================================

export type MarketingTier = 'FREE' | 'STARTER' | 'BUSINESS';

export interface PricingTierData {
  /** Tier identifier — must match SubscriptionTier in lib/api/subscription */
  id: MarketingTier;
  /** Visual cue dot (Tailwind bg-* class) — must match subscription page */
  dotColor: string;
  /** Platform fee literal (e.g. '15%', '5%', '2%') */
  platformFee: string;
  /** Whether to show a "recommended" highlight border */
  highlighted?: boolean;
}

// ==========================================
// STORE BUILDER — CATEGORY
// ==========================================
//
// 6 specific categories shown in the marketing builder. Each maps to
// a real category key in lib/constants/shared/categories.ts so
// auto-skip in register works cleanly (Q5=C decision).
//
// `categoryKey: null` means "Lainnya..." — when picked, builder still
// pre-fills slug + agreement but register lands on Step 2 (Category)
// so the user picks the actual subcat.
// ==========================================

export interface BuilderCategoryData {
  /** Stable id — used as i18n key suffix + React key */
  id: string;
  /** Lucide icon shown on the chip */
  icon: LucideIcon;
  /**
   * Real category key from lib/constants/shared/categories.ts.
   * `null` = "Other" — register opens at Step 2 instead of skipping it.
   */
  categoryKey: string | null;
}
