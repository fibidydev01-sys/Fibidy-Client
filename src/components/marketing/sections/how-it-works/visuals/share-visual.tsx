// ==========================================
// SHARE VISUAL (HOW-IT-WORKS — Step 2)
// File: src/components/marketing/sections/how-it-works/visuals/share-visual.tsx
//
// [PHASE 6 SPLIT — May 2026]
// Extracted from src/components/marketing/sections/how-it-works/index.tsx
// (was the inline `function ShareVisual()` in the v20 monolith).
// Behavior preserved verbatim. Only path changed.
//
// ──────────────────────────────────────────────────────────────────
//
// Phase 5 polish v20 (preserved): split card with muted top half +
// pink-bordered avatar circle in the center, evoking a profile /
// link card visualization for the "share" step.
//
// Visual structure:
//   - Outer card frame (rounded, fill-card + stroke-border)
//   - Top half painted with fill-muted (clipped to card shape)
//   - Horizontal divider at y=140 (stroke-border)
//   - Avatar circle straddling the divider (cx=300, cy=85, r=32)
//     - Stroke pink (stroke-primary, 2px)
//     - Inside: Lucide-style User glyph (head circle + shoulders path)
//
// All colors via Tailwind className — dark mode responsive (was
// hardcoded hex pre-v20, fixed in collection's v20 baseline).
//
// SERVER COMPONENT — pure SVG, no hooks, no state.
// ==========================================

import { DottedBackground } from './dotted-background';

export function ShareVisual() {
  return (
    <div className="relative h-[280px] w-full overflow-hidden">
      <DottedBackground />

      <svg
        viewBox="0 0 600 280"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id="share-card-clip">
            <rect x="100" y="30" width="400" height="220" rx="10" />
          </clipPath>
        </defs>

        {/* Card frame */}
        <rect
          x="100"
          y="30"
          width="400"
          height="220"
          rx="10"
          className="fill-card stroke-border"
          strokeWidth="1"
        />

        {/* Top half — muted */}
        <rect
          x="100"
          y="30"
          width="400"
          height="110"
          className="fill-muted"
          clipPath="url(#share-card-clip)"
        />

        {/* Divider */}
        <line
          x1="100"
          y1="140"
          x2="500"
          y2="140"
          className="stroke-border"
          strokeWidth="1"
        />

        {/* Avatar circle */}
        <circle
          cx="300"
          cy="85"
          r="32"
          className="fill-card stroke-primary"
          strokeWidth="2"
        />

        {/* Lucide User — head */}
        <circle
          cx="300"
          cy="76"
          r="9"
          fill="none"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Lucide User — shoulders */}
        <path
          d="M278 108 C278 97 288 90 300 90 C312 90 322 97 322 108"
          fill="none"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
