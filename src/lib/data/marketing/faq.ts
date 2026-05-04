// ==========================================
// FAQ DATA
// File: src/lib/data/marketing/faq.ts
//
// Phase 2 (Marketing rewrite, May 2026):
//
// 8 Q&A pairs, sequenced as objection-handling cascade:
//   pricing → operational → trust → migration
//
// Same list also feeds the FAQPage JSON-LD generator at
// lib/shared/marketing-schema.ts so search engines + AI agents
// (Google generative results, Perplexity, ChatGPT) can cite us.
//
// ROTATIONS (vs Phase 1 version):
//   - DROPPED: 'platformFee', 'payout', 'kyc', 'tierDifference'
//     All four were Stripe-specific or tier-comparison content that
//     conflicts with current product reality (no Stripe Connect, no
//     paid tiers in Phase 1).
//   - ADDED:   'paymentNoStripe', 'betaRoadmap', 'fibidyVsLinktree',
//              'dataExport'
//     These directly answer the questions a UMKM seller will actually
//     ask after reading "Free during beta": how do I get paid, when
//     does paid launch, why this vs Linktree, am I locked in.
//   - REWRITTEN: 'isFree' (was fee-mention-heavy), 'whatToSell'
//     (was digital-products-heavy)
//   - KEPT:    'customDomain', 'migrate'
//
// Per HANDOFF §4.5 + §2.10: visible text on page (no tabs/images),
// concise answers, no inline expansion.
//
// Cap is 10 — 8 leaves room to add 2 without restructuring. If we
// ever exceed 10, promote to a dedicated /faq page.
//
// Copy at `marketing.faq.items.{id}.q` and `.a` in marketing.json.
// ==========================================

export interface FaqItem {
  /** Stable id — used as React key + i18n key suffix */
  id: string;
}

export const faqItems: readonly FaqItem[] = [
  { id: 'isFree' },
  { id: 'paymentNoStripe' },
  { id: 'customDomain' },
  { id: 'betaRoadmap' },
  { id: 'fibidyVsLinktree' },
  { id: 'whatToSell' },
  { id: 'dataExport' },
  { id: 'migrate' },
] as const;
