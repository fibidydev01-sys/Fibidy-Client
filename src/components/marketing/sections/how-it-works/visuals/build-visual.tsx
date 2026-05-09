// ==========================================
// BUILD VISUAL (HOW-IT-WORKS — Step 1)
// File: src/components/marketing/sections/how-it-works/visuals/build-visual.tsx
//
// [PHASE 6 SPLIT — May 2026]
// Extracted from src/components/marketing/sections/how-it-works/index.tsx
// (was the inline `function BuildVisual()` in the v18+v20 monolith).
// Behavior preserved verbatim. Only path changed.
//
// ──────────────────────────────────────────────────────────────────
//
// Phase 5 polish v18 (preserved): minimalist block grid that
// communicates the "build" step at a glance:
//
//   - 3 template cards on the left (1 active = pink-bordered)
//   - Dashed connector arrow → main preview card
//   - Main preview card with browser chrome (3 traffic dots),
//     hero banner (pink/10), 3 product thumbnails
//
// All colors via Tailwind className utilities (`fill-card`,
// `stroke-border`, `stroke-primary`, `fill-primary/10`, etc.) so
// the visual responds to dark mode automatically.
//
// SERVER COMPONENT — pure SVG, no hooks, no state.
// ==========================================

import { DottedBackground } from './dotted-background';

export function BuildVisual() {
  return (
    <div className="relative h-[280px] w-full overflow-hidden">
      <DottedBackground />

      <svg
        viewBox="0 0 600 280"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Template 1 — neutral */}
        <rect
          x="40"
          y="40"
          width="100"
          height="60"
          rx="6"
          className="fill-card stroke-border"
          strokeWidth="1"
        />

        {/* Template 2 — ACTIVE (pink border only) */}
        <rect
          x="40"
          y="115"
          width="100"
          height="60"
          rx="6"
          className="fill-card stroke-primary"
          strokeWidth="1.5"
        />

        {/* Template 3 — neutral */}
        <rect
          x="40"
          y="190"
          width="100"
          height="60"
          rx="6"
          className="fill-card stroke-border"
          strokeWidth="1"
        />

        {/* Connection arrow from active template to main card */}
        <path
          d="M 142 145 Q 175 145 198 130"
          className="stroke-primary"
          strokeWidth="1"
          strokeDasharray="3,3"
          fill="none"
          opacity="0.5"
        />

        {/* Main preview card */}
        <rect
          x="200"
          y="30"
          width="360"
          height="220"
          rx="10"
          className="fill-card stroke-border"
          strokeWidth="1"
        />

        {/* Browser chrome divider */}
        <line
          x1="200"
          y1="60"
          x2="560"
          y2="60"
          className="stroke-border/50"
          strokeWidth="1"
        />

        {/* 3 traffic dots */}
        <circle
          cx="216"
          cy="45"
          r="3"
          className="fill-muted stroke-border"
          strokeWidth="0.5"
        />
        <circle
          cx="228"
          cy="45"
          r="3"
          className="fill-muted stroke-border"
          strokeWidth="0.5"
        />
        <circle
          cx="240"
          cy="45"
          r="3"
          className="fill-muted stroke-border"
          strokeWidth="0.5"
        />

        {/* Hero banner */}
        <rect
          x="220"
          y="78"
          width="320"
          height="76"
          rx="6"
          className="fill-primary/10"
        />

        {/* 3 product thumbnails */}
        <rect x="220" y="170" width="98" height="64" rx="4" className="fill-muted" />
        <rect x="328" y="170" width="98" height="64" rx="4" className="fill-muted" />
        <rect x="436" y="170" width="98" height="64" rx="4" className="fill-muted" />
      </svg>
    </div>
  );
}
