// ==========================================
// FINAL CTA DATA
// File: src/lib/data/marketing/cta.ts
//
// One section, one button. Per HANDOFF §2.11 + KlientBoost research:
// multiple CTAs in the final section reduce conversions up to 266%.
// We repeat the SAME primary CTA from hero — same label, same href,
// same color — for consistency.
//
// Copy at `marketing.finalCta.*` in marketing.json.
// ==========================================

export interface FinalCtaData {
  /** Primary CTA href — must match hero.ctaPrimaryHref for consistency */
  ctaHref: string;
}

export const finalCta: FinalCtaData = {
  ctaHref: '/register',
};
