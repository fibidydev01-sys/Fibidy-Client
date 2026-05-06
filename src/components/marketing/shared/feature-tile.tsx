// ==========================================
// FEATURE TILE
// File: src/components/marketing/shared/feature-tile.tsx
//
// Phase 5 polish (May 2026 — Huly-style bento):
//
// Tile composition reshaped: visual at top fills available space,
// title + description sit at the bottom in a fixed-height footer.
// This mirrors Huly's productivity bento — visual-first, label-second,
// so the eye lands on the proof-point before the explanation.
//
// Layout per span:
//   large  → md:col-span-2 md:row-span-2  (Studio flagship, 2x2)
//   wide   → md:col-span-2                (Multi-tenant, WhatsApp, 2x1)
//   normal → 1x1 (Theme, SEO, Mobile)
//
// All tiles collapse to 1 col on mobile.
//
// Decorative wrapper: `aria-hidden` on the visual container so screen
// readers skip the mockup. Marketing narrative comes from h3 + p.
// ==========================================

import type { ReactNode } from 'react';
import { cn } from '@/lib/shared/utils';
import type { FeatureSpan } from '@/types/marketing';

interface FeatureTileProps {
  title: string;
  description: string;
  span?: FeatureSpan;
  /** Mini-mockup rendered in the visual area (resolved via FEATURE_VISUALS) */
  children: ReactNode;
}

const SPAN_CLASS: Record<FeatureSpan, string> = {
  large: 'md:col-span-2 md:row-span-2',
  wide: 'md:col-span-2',
  normal: '',
};

const VISUAL_HEIGHT: Record<FeatureSpan, string> = {
  // Larger tile = more vertical space for the visual to breathe
  large: 'min-h-[260px] md:min-h-[320px]',
  wide: 'min-h-[160px] md:min-h-[180px]',
  normal: 'min-h-[160px]',
};

export function FeatureTile({
  title,
  description,
  span = 'normal',
  children,
}: FeatureTileProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors hover:border-primary/40',
        SPAN_CLASS[span],
      )}
    >
      {/* Visual area — fills available space, decorative */}
      <div
        aria-hidden
        className={cn(
          'flex flex-1 items-center justify-center bg-muted/20 p-5',
          VISUAL_HEIGHT[span],
        )}
      >
        {children}
      </div>

      {/* Text footer — fixed-bottom label */}
      <div className="border-t bg-card p-5">
        <h3
          className={cn(
            'font-semibold tracking-tight',
            span === 'large' ? 'text-xl md:text-2xl' : 'text-base md:text-lg',
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'mt-1.5 leading-relaxed text-muted-foreground',
            span === 'large' ? 'text-sm md:text-base' : 'text-sm',
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
