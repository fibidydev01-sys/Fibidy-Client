// ==========================================
// FEATURE TILE
// File: src/components/marketing/shared/feature-tile.tsx
//
// Single tile inside the Features bento grid. Receives an icon, a
// title, a description, and an optional span hint. The CSS Grid
// parent in FeaturesSection handles the layout — this primitive
// only declares its own visual treatment.
//
// Span → desktop layout mapping:
//   large  → md:col-span-2 md:row-span-2
//   wide   → md:col-span-2
//   normal → (no span — default 1×1)
//
// All tiles collapse to 1 col on mobile per HANDOFF §4.4.
// ==========================================

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import type { FeatureSpan } from '@/types/marketing';

interface FeatureTileProps {
  icon: LucideIcon;
  title: string;
  description: string;
  span?: FeatureSpan;
}

const SPAN_CLASS: Record<FeatureSpan, string> = {
  large: 'md:col-span-2 md:row-span-2',
  wide: 'md:col-span-2',
  normal: '',
};

export function FeatureTile({
  icon: Icon,
  title,
  description,
  span = 'normal',
}: FeatureTileProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-card p-6 transition-colors hover:border-primary/40',
        SPAN_CLASS[span],
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </div>

      <h3
        className={cn(
          'mt-4 font-semibold tracking-tight',
          span === 'large' ? 'text-2xl' : 'text-lg',
        )}
      >
        {title}
      </h3>

      <p
        className={cn(
          'mt-2 text-muted-foreground leading-relaxed',
          span === 'large' ? 'text-base' : 'text-sm',
        )}
      >
        {description}
      </p>
    </div>
  );
}
