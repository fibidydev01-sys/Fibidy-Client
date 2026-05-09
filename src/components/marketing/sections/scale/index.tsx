// ==========================================
// SCALE SECTION (stacked-domains proof point)
// File: src/components/marketing/sections/scale/index.tsx
//
// [PHASE 5 SPLIT — May 2026]
//
// CHANGED in Phase 5:
//   1. CONVERTED TO SERVER COMPONENT.
//      - Removed 'use client' directive.
//      - Swapped `useTranslations` (client hook) → `getTranslations`
//        (server async). Function signature now `async`.
//      - This eliminates a client-side bundle entry for the section
//        composer; only DomainStack ships JS to the browser.
//
//   2. EXTRACTED DomainStack to ./domain-stack.tsx (client island).
//      - The animated visual (~110 lines of framer-motion + variants
//        + URL pill markup) lives in its own file now.
//      - DomainStack imports `scaleDomains` from data layer directly,
//        so the section composer doesn't need to pass it as a prop.
//
// PRESERVED from v15.8 (May 2026 — per-section grid rhythm):
//   - createGridStyle({ intensity: 'prominent', mask: 'none' }).
//     Rationale unchanged: this section is literally about "scale" /
//     infrastructure. Grid as metaphor — each cell = potensi storefront.
//     Grid paling jelas di section ini secara sengaja, tanpa mask.
//
//   - Vercel-open layout (3 blocks: header, stack, columns).
//   - Section bypasses SectionShell (positioning context for full-width
//     grid background).
//   - 3-column features layout below the stack.
//   - Mobile-first geometry via CSS custom properties (in DomainStack).
//
// SERVER COMPONENT:
//   No hooks. No state. No event handlers. Just async data resolution
//   (translations) + JSX. The single client island (DomainStack) is
//   nested as a child element — Next.js handles the boundary
//   automatically.
// ==========================================

import { getTranslations } from 'next-intl/server';
import { SectionEyebrow } from '@/components/marketing/primitives/section-eyebrow';
import {
  CornerCrosses,
  createGridStyle,
} from '@/components/marketing/primitives/line-grid-frame';
import { DomainStack } from './domain-stack';
import { scaleFeatures } from '@/lib/marketing/data/scale';
import { cn } from '@/lib/shared/utils';

// ──────────────────────────────────────────────────────────────────
// SECTION GRID CONFIG
// prominent + no mask → grid as infrastructure metaphor, full visible
// ──────────────────────────────────────────────────────────────────
const GRID = createGridStyle({ intensity: 'prominent', mask: 'none' });

export async function ScaleSection() {
  const t = await getTranslations('marketing.scale');

  return (
    <section
      id="scale"
      className="relative scroll-mt-20 overflow-hidden bg-background py-20 md:py-28"
    >
      {/* Section-level grid background */}
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

        {/* BLOCK B — DOMAIN STACK (client island) */}
        <div className="relative mx-auto mt-8 max-w-5xl border-y bg-background md:mt-10">
          <CornerCrosses />
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
            <DomainStack />
          </div>
        </div>

        {/* BLOCK C — FEATURE COLUMNS */}
        <div className="relative mx-auto mt-8 max-w-5xl border-y bg-background md:mt-10">
          <CornerCrosses />
          <div className="grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
            {scaleFeatures.map((feature) => (
              <div
                key={feature.id}
                className="flex flex-col gap-2 px-6 py-8 md:px-8 md:py-10"
              >
                <h3 className="text-base font-semibold tracking-tight">
                  {t(`features.${feature.id}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`features.${feature.id}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
