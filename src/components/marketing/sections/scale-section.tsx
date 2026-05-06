'use client';

// ==========================================
// SCALE SECTION (stacked-domains proof point)
// File: src/components/marketing/sections/scale-section.tsx
//
// Phase 5 polish v16 (May 2026 — per-section grid rhythm):
//
// CHANGED in v16:
//   - GRID_PATTERN_STYLE local declaration REMOVED.
//   - Now uses createGridStyle({ intensity: 'prominent', mask: 'none' }).
//     Rationale:
//       * prominent intensity (0.60 / dark 0.30) — this section is
//         literally about "scale" / infrastructure. Grid menjadi
//         metaphor visual: tiap cell = potensi storefront. Grid
//         paling jelas di section ini secara sengaja.
//       * no mask — biarkan grid mengisi penuh, jangan dipotong.
//         Pesan section-nya "infinite domains, infinite cells".
//
// PRESERVED from v15.8:
//   - Vercel-open layout (3 blocks: header, stack, columns).
//   - Animated stack of browser-chrome bars showing Fibidy
//     subdomains + custom domains.
//   - Vercel traffic-light colors (red-500/blue-500/emerald-500).
//   - Mobile-first geometry via CSS custom properties.
//   - Section bypasses SectionShell.
//   - 'use client' for framer-motion.
// ==========================================

import { Lock } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { SectionEyebrow } from '@/components/marketing/shared/section-eyebrow';
import {
  CornerCrosses,
  createGridStyle,
} from '@/components/marketing/shared/line-grid-frame';
import { scaleDomains, scaleFeatures } from '@/lib/data/marketing/scale';
import { cn } from '@/lib/shared/utils';

// ──────────────────────────────────────────────────────────────────
// SECTION GRID CONFIG
// prominent + no mask → grid as infrastructure metaphor, full visible
// ──────────────────────────────────────────────────────────────────
const GRID = createGridStyle({ intensity: 'prominent', mask: 'none' });

export function ScaleSection() {
  const t = useTranslations('marketing.scale');

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

        {/* BLOCK B — DOMAIN STACK */}
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

// ==========================================
// DOMAIN STACK — preserved verbatim from v15.8
// ==========================================

const SIDE_INSET_STEP_PERCENT = 4;

const stackContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      staggerDirection: -1,
      delayChildren: 0.1,
    },
  },
};

const stackBarVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

function DomainStack() {
  const total = scaleDomains.length;

  return (
    <motion.div
      className={cn(
        'relative w-full',
        '[--stack-offset:28px] [--chrome-height:38px]',
        '[height:calc(var(--stack-offset)*(var(--bar-count)-1)+var(--chrome-height))]',
        'sm:[--stack-offset:36px] sm:[--chrome-height:48px]',
      )}
      style={
        {
          ['--bar-count' as string]: total,
        } as React.CSSProperties
      }
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3, margin: '0px 0px -80px 0px' }}
      variants={stackContainerVariants}
      aria-hidden
    >
      {scaleDomains.map((entry, idx) => {
        const isFocused = idx === total - 1;
        const reverseIdx = total - 1 - idx;
        const insetPercent = reverseIdx * SIDE_INSET_STEP_PERCENT;

        return (
          <motion.div
            key={entry.url}
            variants={stackBarVariants}
            className={cn(
              'absolute rounded-xl border bg-card transition-shadow',
              isFocused ? 'shadow-2xl shadow-primary/10' : 'shadow-sm',
            )}
            style={
              {
                left: `${insetPercent}%`,
                right: `${insetPercent}%`,
                top: `calc(${idx} * var(--stack-offset))`,
                zIndex: idx,
              } as React.CSSProperties
            }
          >
            <div className="flex h-[38px] items-center gap-2 px-2.5 sm:h-12 sm:px-3 sm:py-2.5">
              <div className="flex shrink-0 gap-1 sm:gap-1.5">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5',
                    isFocused ? 'bg-red-500/85' : 'bg-muted-foreground/15',
                  )}
                />
                <span
                  className={cn(
                    'h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5',
                    isFocused ? 'bg-blue-500/85' : 'bg-muted-foreground/15',
                  )}
                />
                <span
                  className={cn(
                    'h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5',
                    isFocused
                      ? 'bg-emerald-500/85'
                      : 'bg-muted-foreground/15',
                  )}
                />
              </div>

              <div
                className={cn(
                  'mx-auto inline-flex min-w-0 items-center gap-1 rounded-md px-2 py-0.5 sm:gap-1.5 sm:px-3 sm:py-1',
                  isFocused ? 'bg-muted' : 'bg-muted/50',
                )}
              >
                <Lock
                  className={cn(
                    'size-2.5 shrink-0 sm:size-3',
                    isFocused
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/50',
                  )}
                />
                <span
                  className={cn(
                    'truncate font-mono text-[10px] sm:text-xs',
                    isFocused
                      ? 'text-foreground'
                      : 'text-muted-foreground/70',
                  )}
                >
                  {entry.url}
                </span>
              </div>

              <div className="w-[32px] shrink-0 sm:w-[42px]" />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}