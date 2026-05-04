// ==========================================
// HERO DATA
// File: src/lib/data/marketing/hero.ts
//
// Hero section non-translatable values. Copy lives in
// messages/{en,id}/marketing.json under `marketing.hero.*`.
//
// [PHASE 4 — May 2026]
// Secondary CTA pivots from "Sign in" (which duplicated the header
// Sign in link, anti-pattern from HANDOFF #2 §5 #11) to "See the demo"
// — a same-page anchor that smooth-scrolls to the Interactive Store
// Builder section. Lenis (active on the (marketing) route group)
// handles the scroll smoothness; `scroll-mt-20` on SectionShell
// handles the sticky header offset.
//
// Why anchor over path:
//   - Phase 3 just shipped the Interactive Store Builder as the
//     primary conversion engine. Hero secondary CTA pointing visitors
//     at it reinforces the funnel.
//   - Anchor scroll keeps the user in-page (no navigation), preserving
//     hero engagement and section context.
//
// `ctaSecondaryHref` carrying a `#anchor` value is a deliberate signal
// to hero-section.tsx: render with a plain `<a>` instead of i18n Link,
// since same-page anchors don't need locale prefixing.
//
// Phase 1 storefront mockup is a pure CSS/SVG component
// (StorefrontMockup) so we don't depend on Studio readiness or
// real product photography. When we have a polished real screenshot,
// swap to <OptimizedImage src="..." /> and delete the mockup.
// ==========================================

export interface HeroData {
  /** Primary CTA — register flow */
  ctaPrimaryHref: string;
  /**
   * Secondary CTA href.
   * Phase 4: same-page anchor (#store-builder) — Lenis handles smoothness,
   * `scroll-mt-20` on SectionShell handles sticky-header offset.
   */
  ctaSecondaryHref: string;
}

export const hero: HeroData = {
  ctaPrimaryHref: '/register',
  ctaSecondaryHref: '#store-builder',
};
