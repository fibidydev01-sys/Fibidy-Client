// ==========================================
// MARKETING TOUR NAMES & TIMING CONSTANTS
// File: src/lib/marketing/onboarding/tour-names.ts
//
// Phase 9 (May 2026 — onboarding co-location):
//
// Single source of truth for marketing tour identifiers + the timing
// constants that pair with them. Pure data, no JSX, no hooks → cheap
// to import from anywhere (server or client).
//
// WHY PREFIX WITH 'marketing-':
//   The (dashboard) route group will eventually mount its own
//   NextStep tours via a parallel `lib/dashboard/onboarding/`.
//   Tour names live in the same NextStep namespace, so prefixing
//   prevents collision (e.g. `marketing-category-picker` vs
//   `dashboard-products-tour`).
//
// MIGRATION FROM PHASE 8:
//   - Old name: `MARKETING_TOUR_NAMES.CATEGORY_GATE = 'category-gate'`
//     (was at lib/data/marketing/tours.tsx)
//   - New name: `MARKETING_TOURS.CATEGORY_PICKER = 'marketing-category-picker'`
//     (here)
//
// USER IMPACT — INTENTIONAL ACCEPTANCE:
//   NextStep stores "tour seen" markers in localStorage with the tour
//   name as the key. Renaming `category-gate` → `marketing-category-picker`
//   means any user who already saw the tour pre-rename will see it
//   AGAIN once on first visit post-rename.
//
//   This is acceptable because:
//     1. The tour auto-dismisses after 2s — no interaction required
//     2. Marketing has not yet hit broad production traffic
//     3. The cleaner naming pays back across every future tour
//
//   Decision logged: planning Q2, default Option A.
//
// CONSUMERS:
//   - lib/marketing/onboarding/tour-config.tsx — uses CATEGORY_PICKER
//     in step definition
//   - components/marketing/sections/store-builder/use-store-builder.ts
//     — uses CATEGORY_PICKER in startNextStep() + TOUR_AUTO_CLOSE_MS
//     in setTimeout()
// ==========================================

/**
 * Stable identifiers for every NextStep tour scoped to the
 * (marketing) route group. Add new entries here, never inline a
 * magic string in trigger sites.
 */
export const MARKETING_TOURS = {
  CATEGORY_PICKER: 'marketing-category-picker',
} as const;

/**
 * Type-narrowed union of every marketing tour identifier. Use as a
 * function parameter type when accepting a tour name from a
 * consumer site so the type system catches typos.
 */
export type MarketingTourName =
  (typeof MARKETING_TOURS)[keyof typeof MARKETING_TOURS];

/**
 * How long the auto-dismissing tour spotlight stays visible (ms).
 *
 * Lives next to the tour identifier rather than at the trigger site
 * because timing is a property of the tour itself, not the consumer.
 * If we add a second tour later with a different auto-close window,
 * we'll add a per-tour timing map here rather than scattering
 * setTimeout duration literals across the codebase.
 */
export const TOUR_AUTO_CLOSE_MS = 2000;
