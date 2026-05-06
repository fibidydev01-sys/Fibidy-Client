// ==========================================
// MARKETING SECTIONS — MASTER ORDER
// File: src/lib/data/marketing/sections.ts
//
// [HANDSFREE COMPOSITION]
// This array is the single source of truth for which sections appear
// on `/` and in what order.
//
// Phase 5 polish v15 (May 2026 — Scale section added):
//
//   'scale' is INSERTED between features and howItWorks. The new
//   section renders a Vercel-inspired multi-tenant proof point:
//   stacked browser-chrome bars showing Fibidy subdomains + custom
//   domains, plus three feature columns (infinite domains / instant
//   SSL / zero maintenance).
//
//   Placement rationale: features sells the product capabilities;
//   scale reassures about infrastructure + custom-domain support;
//   howItWorks shows the path to first sale. The flow becomes:
//
//     "what you get → why it'll keep working → how to use it →
//      what it costs → try it"
//
// Phase 5 polish v2 (May 2026 — Vercel-timeline restoration):
//
//   'howItWorks' is RESTORED between features and pricing. Phase 3
//   removed it in favor of storeBuilder (interactive try-it), but
//   Phase 5 v2 keeps BOTH — they serve different purposes:
//
//     howItWorks  → narrative, conceptual, 3-step Stripe-style
//                   side-by-side rows. Tells visitors WHAT happens
//                   when they sign up (Build → Share → Sell).
//     storeBuilder → interactive, hands-on. Lets visitors TRY
//                    step 1 immediately and convert pre-filled.
//
// Section order rationale (v15):
//   announcement   → optional banner
//   hero           → grab attention, communicate value in <8s
//   problem        → resonance, "this is me"
//   features       → solution overview (Magic UI bento)
//   scale          → ★ NEW · multi-tenant proof point
//   howItWorks     → Stripe-style 3-step narrative
//   pricing        → objection killer #1 — affordability
//   storeBuilder   → conversion engine — try it, pre-fill, sign up
//   faq            → objection killer #2 — handle remaining doubts
//   finalCta       → close
//
// 10 sections total.
// ==========================================

import type { SectionKey } from '@/types/marketing';

export const DEFAULT_SECTIONS: readonly SectionKey[] = [
  'announcement',
  'hero',
  'problem',
  'features',
  'scale',
  'howItWorks',
  'pricing',
  'storeBuilder',
  'faq',
  'finalCta',
] as const;
