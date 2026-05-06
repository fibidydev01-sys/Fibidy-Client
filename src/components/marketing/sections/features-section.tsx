'use client';

// ==========================================
// FEATURES SECTION (Magic UI BENTO — Vercel-open layout)
// File: src/components/marketing/sections/features-section.tsx
//
// Phase 5 polish v16 (May 2026 — per-section grid rhythm + Vercel-open):
//
// CHANGED in v16:
//   - Section now bypasses SectionShell and adopts the Vercel-open
//     layout pattern (matches problem, scale, howItWorks, pricing,
//     faq, finalCta). Section-level full-bleed grid background +
//     content occluder with bg-background + border-y + CornerCrosses
//     at 4 outer corners.
//   - Grid uses createGridStyle({ intensity: 'subtle', mask: 'fade-radial' }).
//     Rationale:
//       * subtle intensity → bento card sudah punya banyak visual
//         (Marquee templates, AnimatedList notifications, AnimatedBeam
//         icons, Calendar). Grid harus mundur biar nggak saingan.
//       * fade-radial → grid clears around the bento area, focusing
//         eye on the cards rather than the texture behind them.
//
// PRESERVED from v15.9:
//   - Section header (eyebrow + headline + subheadline) still REMOVED
//     per CEO directive. Bento grid leads the section.
//   - 4-tile bento layout, FEATURE_VISUALS / FEATURE_ICONS registry,
//     in-page anchors via TILE_HREFS — all preserved verbatim.
//
// Wrapper change rationale: previously SectionShell provided
// `scroll-mt-20`, vertical density (py-20/md:py-28), and container
// constraint. v16 replicates those manually so the section can be
// the positioning context for the full-width grid background
// (SectionShell would constrain the grid to container width).
// ==========================================

import { useTranslations } from 'next-intl';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import {
  CornerCrosses,
  createGridStyle,
} from '@/components/marketing/shared/line-grid-frame';
import {
  FEATURE_VISUALS,
  FEATURE_ICONS,
} from '@/components/marketing/shared/feature-visuals';
import { featureTiles } from '@/lib/data/marketing/features';
import { cn } from '@/lib/shared/utils';

// In-page anchor targets for each tile's "Learn more" button.
const TILE_HREFS: Record<string, string> = {
  studio: '#store-builder',
  orders: '#faq',
  channels: '#faq',
  saveTime: '#store-builder',
};

// ──────────────────────────────────────────────────────────────────
// SECTION GRID CONFIG
// subtle + fade-radial → grid recedes so bento cards take focus
// ──────────────────────────────────────────────────────────────────
const GRID = createGridStyle({ intensity: 'subtle', mask: 'fade-radial' });

export function FeaturesSection() {
  const t = useTranslations('marketing.features');

  return (
    <section
      id="features"
      className="relative scroll-mt-20 overflow-hidden bg-background py-20 md:py-28"
    >
      {/* Section-level grid background */}
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0', GRID.className)}
        style={GRID.style}
      />

      <div className="container relative mx-auto px-4">
        {/*
          BLOCK — BENTO OCCLUDER
          Solid bg-background paints over the grid pattern behind the
          bento, leaving the cards rendered cleanly. border-y for
          horizontal definition. CornerCrosses at 4 outer corners.

          max-w-6xl matches the previous SectionShell-based bento width.
          Inner padding (px-6 py-10 / md:px-10 md:py-14) gives the
          BentoGrid room to breathe inside the block.
        */}
        <div className="relative mx-auto max-w-6xl border-y bg-background">
          <CornerCrosses />
          <div className="px-6 py-10 md:px-10 md:py-14">
            <BentoGrid>
              {featureTiles.map((tile) => {
                const Visual = FEATURE_VISUALS[tile.visualKey];
                const Icon = FEATURE_ICONS[tile.visualKey];
                return (
                  <BentoCard
                    key={tile.id}
                    name={t(`items.${tile.id}.title`)}
                    Icon={Icon}
                    className={tile.className}
                    background={<Visual />}
                    href={TILE_HREFS[tile.id] ?? '#features'}
                    cta={t('cta')}
                  />
                );
              })}
            </BentoGrid>
          </div>
        </div>
      </div>
    </section>
  );
}