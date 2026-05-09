// ==========================================
// SECTION SHELL
// File: src/components/marketing/primitives/section-shell.tsx
//
// [PHASE 2 REFACTOR — May 2026]
// Moved from src/components/marketing/shared/section-shell.tsx
//   → src/components/marketing/primitives/section-shell.tsx
// Behavior preserved verbatim. Only path changed.
//
// `primitives/` is now the canonical home for cross-section reusable
// layout primitives. `shared/` is being retired — section-specific
// helpers will follow in Phase 3.
//
// ──────────────────────────────────────────────────────────────────
//
// Wrapper used by every section to enforce consistent vertical
// rhythm, max-width, and anchor id. Without this, individual
// sections drift on padding values and the page loses its rhythm.
//
// Why a primitive over per-section duplication: changing the
// page's vertical density (e.g. from py-20 to py-24) requires
// editing one file, not seven.
//
// Variant 'tight' is for compact sections (Problem, Final CTA)
// where we want denser stacking. 'normal' is the default for
// content-heavy sections (Features, Pricing, FAQ).
// ==========================================

import type { ReactNode } from 'react';
import { cn } from '@/lib/shared/utils';

interface SectionShellProps {
  /** Anchor id for in-page nav (e.g. 'features' enables href="#features") */
  id?: string;
  /** Vertical density. tight = py-12 md:py-16 / normal = py-20 md:py-28 */
  variant?: 'tight' | 'normal';
  /** Optional background tint — e.g. bg-muted/30 for alternation */
  bgClassName?: string;
  /** Extra utility classes for outer <section> */
  className?: string;
  /** Section content */
  children: ReactNode;
}

export function SectionShell({
  id,
  variant = 'normal',
  bgClassName,
  className,
  children,
}: SectionShellProps) {
  return (
    <section
      id={id}
      // scroll-margin-top so anchor jumps clear the sticky header
      // (Vercel guideline: anchored headings).
      className={cn(
        'scroll-mt-20',
        variant === 'tight' ? 'py-12 md:py-16' : 'py-20 md:py-28',
        bgClassName,
        className,
      )}
    >
      <div className="container mx-auto px-4">{children}</div>
    </section>
  );
}
