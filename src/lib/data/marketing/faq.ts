// ==========================================
// FAQ DATA
// File: src/lib/data/marketing/faq.ts
//
// Phase 2 (Marketing rewrite, May 2026):
//
// 8 Q&A pairs, sequenced as objection-handling cascade:
//   pricing → operational → trust → migration
//
// [POLISH v15.4 — May 2026]
// `betaRoadmap` renamed to `paidPlans`. Beta framing dropped per
// product positioning — Free plan IS permanent ("Forever Free").
// Question reframed from "When do paid plans launch?" (assumes
// they haven't) to "What do paid plans unlock?" — focuses on the
// user value rather than the timeline anxiety.
//
// Same list also feeds the FAQPage JSON-LD generator at
// lib/shared/marketing-schema.ts so search engines + AI agents
// (Google generative results, Perplexity, ChatGPT) can cite us.
//
// ROTATIONS (vs Phase 1 version):
//   - DROPPED: 'platformFee', 'payout', 'kyc', 'tierDifference'
//   - ADDED:   'paymentNoStripe', 'paidPlans', 'fibidyVsLinktree',
//              'dataExport'
//   - REWRITTEN: 'isFree', 'whatToSell'
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
  { id: 'paidPlans' },
  { id: 'fibidyVsLinktree' },
  { id: 'whatToSell' },
  { id: 'dataExport' },
  { id: 'migrate' },
] as const;
