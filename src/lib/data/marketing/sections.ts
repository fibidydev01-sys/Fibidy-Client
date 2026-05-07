// ==========================================
// MARKETING SECTIONS — MASTER ORDER
// File: src/lib/data/marketing/sections.ts
//
// [MINIMAL MODE — May 2026]
// DEFAULT_SECTIONS is now reduced to two entries:
//   - storeBuilder  → conversion engine
//   - finalCta      → close
//
// The full 10-section ladder is preserved as FULL_SECTIONS below
// (commented + exported as a TODO reference) so we can restore
// the original page composition with one edit:
//
//   1. Uncomment FULL_SECTIONS export below.
//   2. Swap `ACTIVE_SECTIONS` import in page.tsx for DEFAULT_SECTIONS
//      (or just point page.tsx at FULL_SECTIONS directly).
//   3. Re-enable the import + REGISTRY entries in page.tsx.
//
// Section order rationale (full page, for reference when restoring):
//   announcement   → optional banner
//   hero           → grab attention, communicate value in <8s
//   problem        → resonance, "this is me"
//   features       → solution overview (Magic UI bento)
//   scale          → multi-tenant proof point
//   howItWorks     → Stripe-style 3-step narrative
//   pricing        → objection killer #1 — affordability
//   storeBuilder   → conversion engine — try it, pre-fill, sign up
//   faq            → objection killer #2 — handle remaining doubts
//   finalCta       → close
// ==========================================

import type { SectionKey } from '@/types/marketing';

// ──────────────────────────────────────────────────────────────────
// ACTIVE: minimal mode (storeBuilder + finalCta only)
// ──────────────────────────────────────────────────────────────────
export const DEFAULT_SECTIONS: readonly SectionKey[] = [
  'storeBuilder',
  'finalCta',
] as const;

// ──────────────────────────────────────────────────────────────────
// TODO: full 10-section ladder — uncomment to restore
//
// export const FULL_SECTIONS: readonly SectionKey[] = [
//   'announcement',
//   'hero',
//   'problem',
//   'features',
//   'scale',
//   'howItWorks',
//   'pricing',
//   'storeBuilder',
//   'faq',
//   'finalCta',
// ] as const;
// ──────────────────────────────────────────────────────────────────