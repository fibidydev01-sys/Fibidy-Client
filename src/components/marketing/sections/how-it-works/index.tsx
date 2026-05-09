// ==========================================
// HOW IT WORKS — SIDE-BY-SIDE ALTERNATING ROWS (Vercel-open line-grid)
// File: src/components/marketing/sections/how-it-works/index.tsx
//
// [PHASE 6 SPLIT — May 2026]
//
// CHANGED in Phase 6:
//   - Extracted 3 step visuals + DottedBackground to ./visuals/:
//     * DottedBackground → ./visuals/dotted-background.tsx
//     * BuildVisual      → ./visuals/build-visual.tsx
//     * ShareVisual      → ./visuals/share-visual.tsx
//     * SellVisual       → ./visuals/sell-visual.tsx
//   - STEP_VISUALS registry → ./visuals/index.ts barrel
//   - Composer shrinks from 414 lines → ~110 lines
//
// PRESERVED:
//   - Server component (was already async via getTranslations)
//   - Vercel-open layout (header + steps blocks with bg-background plates)
//   - Grid: createGridStyle({ intensity: 'soft', mask: 'fade-edges' })
//   - Alternating row layout (text left/visual right, then reversed)
//   - Step number 0X badge + Lucide icon eyebrow
//   - howItWorksSteps data (Palette / Share2 / MessageCircle icons)
//
// SECTION GRID CONFIG (unchanged from v20):
//   soft + fade-edges → quietest grid that still breathes around the
//   step rows; edges fade so steps appear to float on a clean field.
//
// SERVER COMPONENT — getTranslations (async). No hooks. No state.
// All visuals are server SVGs (zero client JS for this section).
// ==========================================

import { getTranslations } from 'next-intl/server';
import { SectionEyebrow } from '@/components/marketing/primitives/section-eyebrow';
import {
  CornerCrosses,
  createGridStyle,
} from '@/components/marketing/primitives/line-grid-frame';
import { STEP_VISUALS } from './visuals';
import { howItWorksSteps } from '@/lib/marketing/data/how-it-works';
import { cn } from '@/lib/shared/utils';

const GRID = createGridStyle({ intensity: 'soft', mask: 'fade-edges' });

export async function HowItWorksSection() {
  const t = await getTranslations('marketing.howItWorks');

  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-20 overflow-hidden bg-background py-20 md:py-28"
    >
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0', GRID.className)}
        style={GRID.style}
      />

      <div className="container relative mx-auto px-4">
        {/* BLOCK A — HEADER */}
        <div className="relative mx-auto max-w-5xl border-y bg-background">
          <CornerCrosses />
          <div className="mx-auto max-w-3xl px-6 py-10 text-center md:py-14">
            <SectionEyebrow>{t('eyebrow')}</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {t('headline')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {t('subheadline')}
            </p>
          </div>
        </div>

        {/* BLOCK B — STEPS */}
        <div className="relative mx-auto mt-8 max-w-6xl border-y bg-background md:mt-10">
          <CornerCrosses />
          <div className="divide-y">
            {howItWorksSteps.map((step, idx) => {
              const Visual = STEP_VISUALS[step.id];
              const Icon = step.icon;
              const isReversed = idx % 2 === 1;

              return (
                <div
                  key={step.id}
                  className="grid items-center gap-8 px-6 py-12 md:grid-cols-2 md:gap-12 md:px-10 md:py-16 lg:gap-16"
                >
                  <div className={cn(isReversed && 'md:order-2')}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/5 text-base font-bold text-primary">
                        0{step.index}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-4 w-4 text-primary" aria-hidden />
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                          {t(`steps.${step.id}.eyebrow`)}
                        </p>
                      </div>
                    </div>

                    <h3 className="mt-5 text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
                      {t(`steps.${step.id}.title`)}
                    </h3>

                    <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                      {t(`steps.${step.id}.description`)}
                    </p>
                  </div>

                  <div
                    aria-hidden
                    className={cn(
                      'overflow-hidden rounded-xl border bg-muted/30',
                      isReversed && 'md:order-1',
                    )}
                  >
                    <Visual />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
