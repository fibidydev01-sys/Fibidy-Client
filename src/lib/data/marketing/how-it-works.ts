// ==========================================
// HOW IT WORKS DATA
// File: src/lib/data/marketing/how-it-works.ts
//
// Phase 5 polish v2 (May 2026 — Vercel timeline):
//
// Three steps repurposed for the new vertical-timeline section:
//   build  → Pick a curated template, customize, see it live
//   share  → Drop your link in WhatsApp / IG / story / bio
//   sell   → Customer taps Order, you handle it via WA
//
// Different from Phase 1's "register/setup/sell" — that flow was
// from the user's signup perspective. This v2 narrative is from the
// outcome perspective: idea → first sale.
//
// Three is the cap. More than three steps signals product complexity
// (HANDOFF §2.7) — even Vercel's "Develop. Preview. Ship." holds at 3.
//
// Copy at `marketing.howItWorks.steps.{id}.*` in marketing.json.
// ==========================================

import { Palette, Share2, MessageCircle } from 'lucide-react';
import type { HowItWorksStep } from '@/types/marketing';

export const howItWorksSteps: readonly HowItWorksStep[] = [
  { id: 'build', index: 1, icon: Palette },
  { id: 'share', index: 2, icon: Share2 },
  { id: 'sell', index: 3, icon: MessageCircle },
] as const;
