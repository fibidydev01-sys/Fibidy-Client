// ==========================================
// LINE GRID FRAME (Vercel-pricing visual primitive)
// File: src/components/marketing/shared/line-grid-frame.tsx
//
// Phase 5 polish v16 (May 2026 — per-section grid rhythm via
// opacity + mask, NOT via cell size):
//
// CHANGED in v16 (rationale: "halaman bernafas tanpa korbanin sistem"):
//
//   The Vercel-open sections (problem, features, scale, howItWorks,
//   pricing, faq, finalCta) used to redeclare an identical
//   GRID_PATTERN_STYLE constant 7+ times. v16 centralizes that into
//   a single `createGridStyle({ intensity, mask })` helper exported
//   from this file. Cell size stays HARDCODED at 128px — it's the
//   foundation, not a tunable. The "rhythm" each section needs is
//   achieved by varying opacity (intensity) and mask gradient.
//
//   WHY NOT CELL SIZE PER SECTION:
//     - Corner cross alignment across sections breaks if cells differ
//     - Mobile readability suffers (256px cells = 1.5 cells visible at 375px)
//     - "Designed feel" depends on consistent grid math
//     - 7 magic numbers is harder to maintain than 2 enums
//
//   WHY OPACITY + MASK:
//     - Subtle enough to feel intentional, not random
//     - Reversible — change one prop, no architectural rework
//     - Section identity emerges from how the grid presents, not what it is
//
// API SURFACE:
//
//   createGridStyle({ intensity, mask })
//     → returns { style, className } pair
//     → consumers spread style on the absolute grid div, append
//       className to the wrapping pointer-events-none container
//
//   GridIntensity = 'subtle' | 'soft' | 'normal' | 'prominent'
//     subtle    → opacity 0.30 (light mode) / 0.15 (dark mode)
//     soft      → opacity 0.40 / 0.20
//     normal    → opacity 0.50 / 0.25  (matches v15.x default)
//     prominent → opacity 0.60 / 0.30
//
//   GridMask = 'none' | 'fade-top' | 'fade-bottom' | 'fade-radial' | 'fade-edges'
//     none         → no mask, grid fills section
//     fade-top     → grid fades into background at top (content lands clean)
//     fade-bottom  → grid fades into background at bottom (handoff to next)
//     fade-radial  → grid clears around section center (focus on hero block)
//     fade-edges   → vignette, grid fades on all 4 sides
//
// Phase 5 polish v15.4 (preserved):
//
//   - `CornerCrosses` is a public NAMED EXPORT.
//   - `LineGridFrame` plate variant (bordered card with bg-card on top
//     of bleeding grid) is preserved as legacy surface area, but
//     v15.9+ sections all use Vercel-open layout instead.
//
// Server component (no hooks, no state). Pure CSS/SVG.
// ==========================================

import { cn } from '@/lib/shared/utils';

// ──────────────────────────────────────────────────────────────────
// GRID STYLE HELPER — per-section rhythm
// ──────────────────────────────────────────────────────────────────

export type GridIntensity = 'subtle' | 'soft' | 'normal' | 'prominent';
export type GridMask =
  | 'none'
  | 'fade-top'
  | 'fade-bottom'
  | 'fade-radial'
  | 'fade-edges';

interface CreateGridStyleOptions {
  /** Opacity dial. Default 'normal' (matches v15.x baseline). */
  intensity?: GridIntensity;
  /** Mask gradient applied to the grid. Default 'none'. */
  mask?: GridMask;
}

interface GridStyleResult {
  /** Spread on the absolute grid div via the `style` prop */
  style: React.CSSProperties;
  /** Append to the same div's `className` for opacity + mask classes */
  className: string;
}

// Cell size is HARDCODED. See header comment for rationale.
const CELL_SIZE_PX = 128;

// ──────────────────────────────────────────────────────────────────
// Intensity → Tailwind opacity utility map
//
// Light/dark pair tuned so dark mode reads at half the visual weight
// of light mode (border token is brighter against dark backgrounds).
// ──────────────────────────────────────────────────────────────────

const INTENSITY_CLASS: Record<GridIntensity, string> = {
  subtle: 'opacity-30 dark:opacity-15',
  soft: 'opacity-40 dark:opacity-20',
  normal: 'opacity-50 dark:opacity-25',
  prominent: 'opacity-60 dark:opacity-30',
};

// ──────────────────────────────────────────────────────────────────
// Mask → CSS mask-image
//
// Each variant uses a linear or radial gradient that transitions
// from opaque (#000) where the grid should be visible to transparent
// (#0000) where it should fade. Both -webkit-mask-image and
// mask-image are emitted via inline style for cross-browser support.
//
// `none` returns empty strings so the consumer doesn't have to
// branch on the result.
// ──────────────────────────────────────────────────────────────────

const MASK_GRADIENT: Record<GridMask, string> = {
  none: '',
  'fade-top':
    'linear-gradient(to bottom, transparent 0%, #000 25%, #000 100%)',
  'fade-bottom':
    'linear-gradient(to bottom, #000 0%, #000 75%, transparent 100%)',
  'fade-radial':
    'radial-gradient(ellipse at center, transparent 10%, #000 70%)',
  'fade-edges':
    'radial-gradient(ellipse at center, #000 50%, transparent 95%)',
};

/**
 * Build a grid style + className pair tuned for a specific section's
 * rhythm. Cell size stays at 128px globally; intensity and mask are
 * the only knobs.
 *
 * USAGE:
 *   const GRID = createGridStyle({ intensity: 'normal', mask: 'fade-bottom' });
 *   ...
 *   <div
 *     aria-hidden
 *     className={cn('pointer-events-none absolute inset-0', GRID.className)}
 *     style={GRID.style}
 *   />
 */
export function createGridStyle(
  opts: CreateGridStyleOptions = {},
): GridStyleResult {
  const intensity = opts.intensity ?? 'normal';
  const mask = opts.mask ?? 'none';

  const style: React.CSSProperties = {
    backgroundImage: [
      'linear-gradient(to right, var(--color-border) 1px, transparent 1px)',
      'linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)',
    ].join(','),
    backgroundSize: `${CELL_SIZE_PX}px ${CELL_SIZE_PX}px`,
  };

  if (mask !== 'none') {
    const gradient = MASK_GRADIENT[mask];
    style.WebkitMaskImage = gradient;
    style.maskImage = gradient;
  }

  return {
    style,
    className: INTENSITY_CLASS[intensity],
  };
}

// ──────────────────────────────────────────────────────────────────
// LEGACY: GRID_PATTERN_STYLE
//
// Kept as a named export for backward compat. Resolves to the
// `normal` intensity / no-mask baseline (matches v15.x usage).
// New consumers should call createGridStyle() directly.
// ──────────────────────────────────────────────────────────────────

export const GRID_PATTERN_STYLE: React.CSSProperties = {
  backgroundImage: [
    'linear-gradient(to right, var(--color-border) 1px, transparent 1px)',
    'linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)',
  ].join(','),
  backgroundSize: `${CELL_SIZE_PX}px ${CELL_SIZE_PX}px`,
};

// ==========================================
// LINE GRID FRAME — legacy plate variant
// ==========================================
//
// Preserved as v15.x surface area. Vercel-open sections (v15.9+)
// don't use this — they bypass it and render their own section-
// level grid background plus border-y content blocks. This wrapper
// stays exported in case a future section wants the bordered-plate
// look back (e.g. "card" sections vs. "narrative" sections).
// ==========================================

interface LineGridFrameProps {
  children: React.ReactNode;
  className?: string;
  plateClassName?: string;
}

export function LineGridFrame({
  children,
  className,
  plateClassName,
}: LineGridFrameProps) {
  return (
    <div className={cn('relative', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-4 -inset-y-8 opacity-60 sm:-inset-x-8 md:-inset-x-16 md:-inset-y-12 dark:opacity-30"
        style={GRID_PATTERN_STYLE}
      />
      <div className={cn('relative border bg-card', plateClassName)}>
        <CornerCrosses />
        {children}
      </div>
    </div>
  );
}

// ==========================================
// CORNER CROSSES — public export since v15.4
// ==========================================
//
// Four +'s, one at each outer corner of the parent. Each is offset
// by half its own width so the cross's center lands exactly on the
// corner intersection. z-20 puts them above the parent's border.
//
// Color: muted-foreground at 50% opacity — visible but quiet,
// matches Vercel's understated treatment.
//
// USAGE:
//   <div className="relative border-y ...">
//     <CornerCrosses />
//     {/* content */}
//   </div>
//
// The parent MUST be `relative` for the absolute-positioned crosses
// to anchor to its corners.
// ==========================================

export function CornerCrosses() {
  return (
    <>
      <CrossMark className="-left-[6px] -top-[6px]" />
      <CrossMark className="-right-[6px] -top-[6px]" />
      <CrossMark className="-bottom-[6px] -left-[6px]" />
      <CrossMark className="-bottom-[6px] -right-[6px]" />
    </>
  );
}

function CrossMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      width="12"
      height="12"
      viewBox="0 0 12 12"
      className={cn(
        'pointer-events-none absolute z-20 text-muted-foreground/50',
        className,
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M6 0v12 M0 6h12" />
    </svg>
  );
}