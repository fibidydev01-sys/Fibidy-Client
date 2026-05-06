// ==========================================
// MARKETING TYPES
// File: src/types/marketing.ts
//
// Cross-component types for the (marketing) public landing.
// Per HANDOFF §7: only types used in 2+ files live here.
//
// Phase 5 polish v15 (May 2026 — Scale section added):
//
//   - SectionKey gains 'scale' between 'features' and 'howItWorks'.
//     The new section renders a Vercel-inspired stacked-domains
//     visual + three feature columns (infinite domains / instant
//     SSL / zero maintenance). See:
//       - components/marketing/sections/scale-section.tsx
//       - lib/data/marketing/scale.ts
//
// Phase 5 polish v6 (May 2026 — official Magic UI bento parity):
//
//   - FeatureSpan stays REMOVED (dropped in v5). Magic UI's BentoCard
//     consumes raw className strings for grid placement; an enum
//     adds nothing.
//
//   - FeatureVisualKey union expanded back to 4 keys to match the
//     official Magic UI bento-grid demo:
//        v5: 'studio' | 'orders' | 'saveTime'
//        v6: 'studio' | 'orders' | 'channels' | 'saveTime'
//     `channels` is the AnimatedBeam tile — Fibidy's spin on the
//     official "Integrations" card. Visualises a Fibidy storefront
//     fanning out to the channels customers actually use (WhatsApp,
//     Instagram, TikTok, custom domain, subdomain).
//
//   - FeatureTileData.className stays — it's how each tile drives
//     its grid placement (`col-span-3 lg:col-span-1` / `col-span-3
//     lg:col-span-2`). Same shape as v5.
//
// Other types (SectionKey, HowItWorksStep, PricingTierData,
// BuilderCategoryData, BuilderVisualKey) untouched.
// ==========================================

import type { LucideIcon } from 'lucide-react';

// ==========================================
// SECTION REGISTRY
// ==========================================

export type SectionKey =
  | 'announcement'
  | 'hero'
  | 'problem'
  | 'features'
  | 'scale'
  | 'howItWorks'
  | 'pricing'
  | 'storeBuilder'
  | 'faq'
  | 'finalCta';

// ==========================================
// FEATURE TILE (Magic UI bento — 4 tiles as of v6)
// ==========================================

/**
 * Visual mockup key — resolved through FEATURE_VISUALS registry in
 * `components/marketing/shared/feature-visuals.tsx`.
 *
 * Phase 5 v6: 4 keys mirroring the official Magic UI bento-grid demo
 * (Save your files / Notifications / Integrations / Calendar) — each
 * reframed for Fibidy's UMKM voice.
 */
export type FeatureVisualKey = 'studio' | 'orders' | 'channels' | 'saveTime';

export interface FeatureTileData {
  /** Stable id, used as i18n key suffix and React key */
  id: string;
  /**
   * Raw Tailwind grid placement classes. Magic UI's bento demo uses
   * the 3-column pattern:
   *   'col-span-3 lg:col-span-1'   — small tile
   *   'col-span-3 lg:col-span-2'   — wide tile
   * Mobile fallback `col-span-3` ensures every tile fills the row
   * width when the grid collapses to a single column.
   */
  className: string;
  /** Which visual renders inside the card's background slot */
  visualKey: FeatureVisualKey;
}

// ==========================================
// HOW IT WORKS (side-by-side rows as of v3 — was timeline in v2)
// ==========================================

/**
 * Three-step narrative — Build → Share → Sell. Each step renders
 * inline visuals defined within the section component.
 */
export interface HowItWorksStep {
  /** i18n key suffix under howItWorks.steps.{id} */
  id: 'build' | 'share' | 'sell';
  /** Visible step number (1-indexed) */
  index: 1 | 2 | 3;
  /** Lucide icon shown beside the eyebrow row */
  icon: LucideIcon;
}

// ==========================================
// PRICING TIER
// ==========================================

export type MarketingTier = 'FREE' | 'STARTER' | 'BUSINESS';

export interface PricingTierData {
  id: MarketingTier;
  dotColor: string;
  platformFee: string;
  highlighted?: boolean;
}

// ==========================================
// STORE BUILDER — CATEGORY
// ==========================================

export type BuilderVisualKey =
  | 'restaurant'
  | 'coffeeshop'
  | 'fashion'
  | 'beautySalon'
  | 'cleaning'
  | 'retail';

export interface BuilderCategoryData {
  id: string;
  icon: LucideIcon;
  categoryKey: string;
  visualKey: BuilderVisualKey;
}
