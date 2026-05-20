// ==========================================
// MARKETING SECTIONS — MASTER ORDER
// File: src/lib/marketing/data/sections.ts
//
// Phase 10 (May 2026 — registry pattern):
//
// CHANGED IN PHASE 10:
//   - Exported `ACTIVE_SECTIONS` as the canonical render-order list
//     consumed by page.tsx (was previously a local constant declared
//     INSIDE page.tsx, ignoring DEFAULT_SECTIONS export).
//   - Exported `FULL_SECTIONS` as the all-10-sections array for
//     trivial mode flip. Activate full mode by swapping the
//     `ACTIVE_SECTIONS` body to `FULL_SECTIONS` (one-line edit).
//   - DEFAULT_SECTIONS export retained for backward compat (in case
//     any external consumer still imports the old name).
//
// MINIMAL MODE TOGGLE (current state — May 2026):
//   ACTIVE_SECTIONS = ['storeBuilder', 'finalCta']
//   8 lainnya stay defined in FULL_SECTIONS for one-edit restore.
//
// To restore full page composition:
//   1. Change ACTIVE_SECTIONS export below from minimal array to FULL_SECTIONS.
//   2. No other file touched.
//
// Why a single registry-driven array (Phase 10 pattern):
//   Section render ORDER is now LITERALLY this array's order. page.tsx
//   maps via SECTION_REGISTRY[key]. Reordering = reorder this array.
//   Removing = delete entry. Adding = add entry + add to registry.
//   No JSX edits anywhere.
//
// Section order rationale (full page — updated post-reorder):
//   announcement   → optional banner
//   storeBuilder   → conversion engine — try it, pre-fill, sign up (MOVED TO TOP)
//   hero           → grab attention, communicate value in <8s (MOVED BELOW storeBuilder)
//   problem        → resonance, "this is me"
//   features       → solution overview (Magic UI bento)
//   scale          → multi-tenant proof point
//   howItWorks     → Stripe-style 3-step narrative
//   pricing        → objection killer #1 — affordability
//   faq            → objection killer #2 — handle remaining doubts
//   finalCta       → close
// ==========================================

import type { SectionKey } from '@/types/marketing';

// ──────────────────────────────────────────────────────────────────
// FULL: every marketing section in canonical render order.
// Pre-defined here so MINIMAL_SECTIONS / ACTIVE_SECTIONS / future
// experimental subsets all reference one source of truth for ordering.
//
// ORDER CHANGE (May 2026):
//   storeBuilder moved to position 2 (after announcement).
//   hero moved to position 3 (after storeBuilder).
//   Rationale: lead with the conversion engine, let hero serve as
//   an orienting section for visitors who scroll past the builder.
// ──────────────────────────────────────────────────────────────────
export const FULL_SECTIONS: readonly SectionKey[] = [
  'announcement',
  'storeBuilder',
  'hero',
  'problem',
  'features',
  'scale',
  'howItWorks',
  'pricing',
  'faq',
  'finalCta',
] as const;

// ──────────────────────────────────────────────────────────────────
// MINIMAL: just the conversion engine + close.
// Kept as a separate named constant so swapping ACTIVE_SECTIONS
// between modes is one identifier change, not array rewriting.
// ──────────────────────────────────────────────────────────────────
export const MINIMAL_SECTIONS: readonly SectionKey[] = [
  'storeBuilder',
  'finalCta',
] as const;

// ──────────────────────────────────────────────────────────────────
// ACTIVE: the array page.tsx renders. Now set to FULL_SECTIONS.
//
// To revert to minimal mode, swap the right-hand side back to
// MINIMAL_SECTIONS — a single-token edit, no other file touched.
// ──────────────────────────────────────────────────────────────────
export const ACTIVE_SECTIONS: readonly SectionKey[] = FULL_SECTIONS;

// ──────────────────────────────────────────────────────────────────
// LEGACY: DEFAULT_SECTIONS retained as alias for backward compat.
// Any external consumer (e.g. tests, sitemap generators) still using
// the old name keeps working. New consumers should import
// ACTIVE_SECTIONS instead.
// ──────────────────────────────────────────────────────────────────
export const DEFAULT_SECTIONS = ACTIVE_SECTIONS;