// ==========================================
// MARKETING SECTIONS — MASTER ORDER
// File: src/lib/data/marketing/sections.ts
//
// [HANDSFREE COMPOSITION]
// This array is the single source of truth for which sections appear
// on `/` and in what order. Sections are removed by deleting the entry,
// reordered by reordering the array, and toggled by commenting out.
//
// Phase 3 (Interactive Store Builder, May 2026):
//
//   Q6 = O1 — REPLACE 'howItWorks' with 'storeBuilder'.
//
//   The Interactive Store Builder lets visitors *try* the product (pick
//   category → claim subdomain → see live preview → CTA hands off to
//   register pre-filled). That's a stronger demonstration of "how it
//   works" than three numbered icons could ever be.
//
//   The old how-it-works files (data + section component + i18n keys)
//   are deleted in Phase 3 — see README.md Step 1.
//
// Phase 1 deliberately SKIPS:
//   - 'logos'        → no real partner/customer logos yet (HANDOFF §2.4)
//   - 'testimonials' → no verified UMKM testimonials yet (HANDOFF §2.8)
//
// Both sections are intentionally NOT in the registry either — adding
// fake/placeholder data would damage credibility per playbook
// anti-pattern §5 #12.
//
// 'announcement' is in the order but driven by `announcement.active` in
// announcement.ts data file. When inactive, AnnouncementBar renders null,
// so the section is effectively a no-op cost (one component import).
//
// Section order rationale (Phase 3):
//   hero          → grab attention, communicate value in <8s
//   problem       → resonance, "this is me"
//   features      → solution, what's in the box (bento)
//   pricing       → objection killer #1 — "is this affordable?"
//   storeBuilder  → conversion engine — try it, pre-fill, sign up
//   faq           → objection killer #2 — handle remaining doubts
//   finalCta      → close
//
// storeBuilder sits AFTER pricing (instead of before) deliberately:
// price-skeptical visitors get reassurance first ("free during beta"),
// then they're ready to invest 30s trying the builder.
// ==========================================

import type { SectionKey } from '@/types/marketing';

export const DEFAULT_SECTIONS: readonly SectionKey[] = [
  'announcement',
  'hero',
  'problem',
  'features',
  'pricing',
  'storeBuilder',
  'faq',
  'finalCta',
] as const;
