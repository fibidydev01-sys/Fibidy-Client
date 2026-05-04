// ==========================================
// PRICING DATA
// File: src/lib/data/marketing/pricing.ts
//
// [PHASE 4 — May 2026, Q18]
// Restored to the 3-tier ladder (FREE / STARTER / BUSINESS) after a
// brief detour to single-Free-Beta in Phase 2 (Q2=B3). Reasoning per
// HANDOFF #2 user pivot:
//
//   - The dashboard subscription page already shows the full 3-tier
//     ladder with grouped Coming Soon for digital features when
//     FEATURES.digitalProducts is OFF. Marketing was diverging.
//
//   - Single source of truth: marketing pricing-section now consumes
//     the SAME tier names + features + digital features + coming-soon
//     labels as dashboard subscription, via the
//     `dashboard.subscription.plans.*` i18n namespace. This file
//     supplies only the DATA hooks — tier ids, dot colors, platform
//     fees, and the `highlighted` flag — that don't belong in i18n.
//
// The visual identity dot colors mirror dashboard subscription's
// `PLAN_STATIC[tier].dotColor` values:
//   - FREE     → bg-slate-400  (subtle / starter neutral)
//   - STARTER  → bg-emerald-500 (recommended primary green)
//   - BUSINESS → bg-violet-500  (premium tier)
//
// Platform fee values mirror dashboard subscription's `PLATFORM_FEE`
// record verbatim. These are passed into <PricingCard> and shown in
// the Coming Soon panel (when FEATURES.digitalProducts = false) or
// in a muted box (when ON).
//
// HIGHLIGHTED tier: STARTER. Per common SaaS pricing UX, the middle
// tier gets the recommended border ring to anchor the visitor's
// attention on the upsell target.
// ==========================================

import type { PricingTierData } from '@/types/marketing';

export const pricingTiers: readonly PricingTierData[] = [
  {
    id: 'FREE',
    dotColor: 'bg-slate-400',
    platformFee: '15%',
  },
  {
    id: 'STARTER',
    dotColor: 'bg-emerald-500',
    platformFee: '5%',
    highlighted: true,
  },
  {
    id: 'BUSINESS',
    dotColor: 'bg-violet-500',
    platformFee: '2%',
  },
] as const;
