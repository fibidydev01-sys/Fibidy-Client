// ==========================================
// HOW-IT-WORKS VISUALS — REGISTRY (BARREL)
// File: src/components/marketing/sections/how-it-works/visuals/index.ts
//
// [PHASE 6 SPLIT — May 2026]
// Was inline `STEP_VISUALS` record + 3 visual functions inside the
// section composer (414 lines monolith). Phase 6 split:
//   - DottedBackground → ./dotted-background.tsx
//   - BuildVisual      → ./build-visual.tsx
//   - ShareVisual      → ./share-visual.tsx
//   - SellVisual       → ./sell-visual.tsx
//
// This file (`index.ts`, NOT `index.tsx`) holds ONLY the registry
// the section composer consumes. No JSX inline; barrel only.
//
// Why .ts and not .tsx:
//   No JSX in this file — the helper components live in sibling
//   files. `.ts` makes the boundary explicit and keeps tree-shakers
//   honest about what this module owns.
//
// Why a barrel:
//   The section composer iterates step ids via `howItWorksSteps`
//   (lib/data/marketing/how-it-works.ts) and looks up the matching
//   visual via `STEP_VISUALS[step.id]`. Keeping the import path
//   stable (`'./visuals'`) lets TypeScript auto-resolve to
//   `./visuals/index.ts` without per-visual imports in the composer.
//
// Behavior preserved verbatim — same registry shape, same visual
// component identities, same step-id keys.
// ==========================================

import { BuildVisual } from './build-visual';
import { ShareVisual } from './share-visual';
import { SellVisual } from './sell-visual';

// ──────────────────────────────────────────────────────────────────
// REGISTRY — keyed by HowItWorksStep['id']
//
// Step ids come from `lib/data/marketing/how-it-works.ts`:
//   'build' | 'share' | 'sell'
//
// Typed as Record<string, ...> rather than the strict
// HowItWorksStep['id'] union to keep this barrel decoupled from the
// data-layer type. The composer's lookup `STEP_VISUALS[step.id]` is
// already constrained by the iteration source.
// ──────────────────────────────────────────────────────────────────

export const STEP_VISUALS: Record<string, () => React.ReactElement> = {
  build: BuildVisual,
  share: ShareVisual,
  sell: SellVisual,
};
