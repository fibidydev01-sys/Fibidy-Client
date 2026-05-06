'use client';

// ==========================================
// FINAL CTA SECTION
// File: src/components/marketing/sections/final-cta-section.tsx
//
// Phase 5 polish v16 (May 2026 — per-section grid rhythm):
//
// CHANGED in v16:
//   - GRID_PATTERN_STYLE local declaration REMOVED.
//   - Now uses createGridStyle({ intensity: 'normal', mask: 'fade-radial' }).
//     Rationale:
//       * normal intensity (0.50 / dark 0.25) — closing section
//         deserves visible texture untuk wrap up halaman. Bukan
//         section yang harus "mundur".
//       * fade-radial → grid jelas di sekeliling, transparent di
//         tengah (radius dimana CTA block sit). Efeknya: mata user
//         secara natural fokus ke RainbowButton di tengah, grid jadi
//         frame yang ngarahin attention. Persis kayak vignette di
//         fotografi — center subject pop, edges retreat.
//
// PRESERVED from v15.9:
//   - Vercel-open layout (single CTA block).
//   - 'use client' (RainbowButton needs onClick → router.push).
//   - Single CTA per HANDOFF §4.1 + KlientBoost research.
//   - ctaHref imported from finalCta data → matches hero primary CTA.
//   - Headline + subheadline + RainbowButton + trustLine verbatim.
// ==========================================

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { RainbowButton } from '@/components/ui/rainbow-button';
import {
  CornerCrosses,
  createGridStyle,
} from '@/components/marketing/shared/line-grid-frame';
import { finalCta } from '@/lib/data/marketing/cta';
import { cn } from '@/lib/shared/utils';

// ──────────────────────────────────────────────────────────────────
// SECTION GRID CONFIG
// normal + fade-radial → vignette focus on CTA, grid frames the moment
// ──────────────────────────────────────────────────────────────────
const GRID = createGridStyle({ intensity: 'normal', mask: 'fade-radial' });

export function FinalCtaSection() {
  const t = useTranslations('marketing.finalCta');
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-28">
      {/* Section-level grid background */}
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0', GRID.className)}
        style={GRID.style}
      />

      <div className="container relative mx-auto px-4">
        {/* BLOCK — CTA */}
        <div className="relative mx-auto max-w-5xl border-y bg-background">
          <CornerCrosses />
          <div className="px-6 py-16 text-center md:px-12 md:py-20">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {t('headline')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {t('subheadline')}
            </p>

            <div className="mt-8 flex justify-center">
              <RainbowButton
                className="group h-11 min-w-[220px] text-sm font-semibold"
                onClick={() => router.push(finalCta.ctaHref)}
              >
                {t('ctaPrimary')}
                <ArrowRight
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </RainbowButton>
            </div>

            <p className="mt-5 text-xs text-muted-foreground">
              {t('trustLine')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}