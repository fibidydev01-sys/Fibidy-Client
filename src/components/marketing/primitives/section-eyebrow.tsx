// ==========================================
// SECTION EYEBROW
// File: src/components/marketing/primitives/section-eyebrow.tsx
//
// [PHASE 2 REFACTOR — May 2026]
// Moved from src/components/marketing/shared/section-eyebrow.tsx
//   → src/components/marketing/primitives/section-eyebrow.tsx
// Behavior preserved verbatim. Only path changed.
//
// ──────────────────────────────────────────────────────────────────
//
// The small uppercase label that sits above section headlines.
// Used in: Problem, Features, Pricing, How It Works, FAQ.
// Hero uses its own slightly larger eyebrow inline.
//
// Style choice: thin uppercase + tracking + primary color is the
// Vercel/Linear convention. We keep it muted so it never competes
// with the H2 below it.
// ==========================================

import { cn } from '@/lib/shared/utils';

interface SectionEyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionEyebrow({ children, className }: SectionEyebrowProps) {
  return (
    <p
      className={cn(
        'text-xs font-semibold uppercase tracking-[0.18em] text-primary',
        className,
      )}
    >
      {children}
    </p>
  );
}
