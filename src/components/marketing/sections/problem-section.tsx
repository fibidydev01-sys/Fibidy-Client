// ==========================================
// PROBLEM SECTION
// File: src/components/marketing/sections/problem-section.tsx
//
// Phase 5 polish v16 (May 2026 — per-section grid rhythm):
//
// CHANGED in v16:
//   - GRID_PATTERN_STYLE local declaration REMOVED.
//   - Now uses `createGridStyle({ intensity, mask })` helper from
//     line-grid-frame.tsx. Cell size stays 128px globally — only
//     opacity + mask vary per section.
//   - This section: `intensity: 'soft'` (0.40 / dark 0.20) +
//     `mask: 'fade-bottom'`. Rationale:
//       * soft intensity → intro section, not the visual climax,
//         grid recede ke background.
//       * fade-bottom → hand off cleanly into features below; grid
//         tipis di bawah biar transisi mulus.
//
// PRESERVED from v15.7:
//   - Vercel-open layout (section-level grid, content blocks
//     occlude with bg-background + border-y + CornerCrosses).
//   - Two blocks: headline (max-w-5xl + max-w-3xl inner) and
//     content (max-w-5xl with 3-col divide-x at md+).
//   - Section bypasses SectionShell to be the positioning context
//     for the full-width grid background.
//   - bg-background (no color tint).
//   - Three-pain-point cap (HANDOFF §2.5).
//   - Icon plates rounded-lg (badge primitives, not page chrome).
// ==========================================

import { getTranslations } from 'next-intl/server';
import { SectionEyebrow } from '@/components/marketing/shared/section-eyebrow';
import {
  CornerCrosses,
  createGridStyle,
} from '@/components/marketing/shared/line-grid-frame';
import { problemItems } from '@/lib/data/marketing/problem';
import { cn } from '@/lib/shared/utils';

// ──────────────────────────────────────────────────────────────────
// SECTION GRID CONFIG
// soft + fade-bottom → quiet intro, clean handoff to features
// ──────────────────────────────────────────────────────────────────
const GRID = createGridStyle({ intensity: 'soft', mask: 'fade-bottom' });

export async function ProblemSection() {
  const t = await getTranslations('marketing.problem');

  return (
    <section
      className="relative scroll-mt-20 overflow-hidden bg-background py-12 md:py-16"
    >
      {/* Section-level grid background */}
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0', GRID.className)}
        style={GRID.style}
      />

      <div className="container relative mx-auto px-4">
        {/* BLOCK A — HEADLINE */}
        <div className="relative mx-auto max-w-5xl border-y bg-background">
          <CornerCrosses />
          <div className="mx-auto max-w-3xl px-6 py-10 text-center md:py-14">
            <SectionEyebrow>{t('eyebrow')}</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              {t('headline')}
            </h2>
          </div>
        </div>

        {/* BLOCK B — CONTENT */}
        <div className="relative mx-auto mt-8 max-w-5xl border-y bg-background md:mt-10">
          <CornerCrosses />
          <div className="grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
            {problemItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex flex-col items-start gap-3 px-6 py-8 md:px-8 md:py-10"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="text-base font-semibold">
                    {t(`items.${item.id}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`items.${item.id}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}