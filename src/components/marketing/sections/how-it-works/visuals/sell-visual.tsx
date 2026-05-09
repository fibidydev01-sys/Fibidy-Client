// ==========================================
// SELL VISUAL (HOW-IT-WORKS — Step 3)
// File: src/components/marketing/sections/how-it-works/visuals/sell-visual.tsx
//
// [PHASE 6 SPLIT — May 2026]
// Extracted from src/components/marketing/sections/how-it-works/index.tsx
// (was the inline `function SellVisual()` in the v20 monolith).
// Behavior preserved verbatim. Only path changed.
//
// ──────────────────────────────────────────────────────────────────
//
// Phase 5 polish v20 (preserved): two chat bubbles representing the
// final "sell" step — customer asks (left bubble, muted), seller
// confirms (right bubble, pink-tinted). Distills the WhatsApp-first
// ordering experience into a minimalist pictogram.
//
// Visual structure:
//   - Outer card frame (rounded-2xl-ish via rx=12)
//   - Customer bubble (top-left): fill-muted, smaller, neutral tone
//   - Seller bubble (bottom-right): fill-primary/10 + stroke-primary,
//     larger, brand-tinted to draw the eye
//
// Color treatment via Tailwind className — dark mode responsive
// (was hardcoded hex pre-v20, fixed in collection's v20 baseline).
//
// SERVER COMPONENT — pure SVG, no hooks, no state.
// ==========================================

import { DottedBackground } from './dotted-background';

export function SellVisual() {
  return (
    <div className="relative h-[280px] w-full overflow-hidden">
      <DottedBackground />

      <svg
        viewBox="0 0 600 280"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Card frame */}
        <rect
          x="120"
          y="30"
          width="360"
          height="220"
          rx="12"
          className="fill-card stroke-border"
          strokeWidth="1"
        />

        {/* Bubble 1 — customer */}
        <rect
          x="140"
          y="70"
          width="210"
          height="52"
          rx="12"
          className="fill-muted"
        />

        {/* Bubble 2 — seller */}
        <rect
          x="230"
          y="158"
          width="230"
          height="60"
          rx="12"
          className="fill-primary/10 stroke-primary"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
