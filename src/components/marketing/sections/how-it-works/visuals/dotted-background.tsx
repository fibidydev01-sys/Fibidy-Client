// ==========================================
// DOTTED BACKGROUND (HOW-IT-WORKS — shared visual primitive)
// File: src/components/marketing/sections/how-it-works/visuals/dotted-background.tsx
//
// [PHASE 6 SPLIT — May 2026]
// Extracted from src/components/marketing/sections/how-it-works/index.tsx
// (was the inline `function DottedBackground()` in the v20 monolith).
// Behavior preserved verbatim. Only path changed.
//
// ──────────────────────────────────────────────────────────────────
//
// Subtle dotted-grid texture used as the background of all 3 step
// visuals (Build, Share, Sell). Pure SVG <pattern> with 20px tile
// + 1px-radius dot at 50% opacity.
//
// Why a separate file:
//   - All 3 step visuals consume it
//   - Co-located in `visuals/` keeps the related primitives grouped
//   - Pure server component (no JS, no hooks)
//
// Pattern id `how-it-works-dots` is unique to this section's namespace
// so it won't collide with other SVG <defs> elsewhere on the page.
// If you ever render multiple instances side-by-side and want fully
// scoped pattern ids, switch to React.useId() + 'use client' (not
// needed today since the visuals don't stack on top of each other).
// ==========================================

export function DottedBackground() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-50"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <pattern
        id="how-it-works-dots"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="2" cy="2" r="1" className="fill-muted-foreground/30" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#how-it-works-dots)" />
    </svg>
  );
}
