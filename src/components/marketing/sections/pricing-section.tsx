// ==========================================
// PRICING SECTION (3-tier mirror — Vercel-open line-grid)
// File: src/components/marketing/sections/pricing-section.tsx
//
// Phase 5 polish v16 (May 2026 — per-section grid rhythm):
//
// CHANGED in v16:
//   - GRID_PATTERN_STYLE local declaration REMOVED.
//   - Now uses createGridStyle({ intensity: 'soft', mask: 'fade-top' }).
//     Rationale:
//       * soft intensity (0.40 / dark 0.20) — pricing cards are
//         visually heavy (tier badges, price numbers, feature lists).
//         Grid harus subtle biar kartu yang dominan.
//       * fade-top → grid tipis di atas, lebih jelas di bawah.
//         Efeknya: kartu pricing seolah "ngambang" di area atas yang
//         lapang, terus grid muncul di bawah sebagai grounding.
//         Decision moment terasa fokus, bukan crowded.
//
// PRESERVED from v15.9:
//   - Vercel-open layout (header block + 3 pricing columns block).
//   - Popular tab badge wired to top border with -translate-y-1/2.
//   - 3 cards inside one block with md:divide-x, mobile divide-y.
//   - PricingCard contract — flat, no outer chrome.
//   - i18n mirror via dashboard.subscription.* (Q19 SoT).
//   - FEATURES.digitalProducts gate drives Coming Soon group.
// ==========================================

import { getTranslations } from 'next-intl/server';
import { SectionEyebrow } from '@/components/marketing/shared/section-eyebrow';
import {
  CornerCrosses,
  createGridStyle,
} from '@/components/marketing/shared/line-grid-frame';
import { PricingCard } from '@/components/marketing/shared/pricing-card';
import { pricingTiers } from '@/lib/data/marketing/pricing';
import { FEATURES } from '@/lib/config/features';
import type { MarketingTier } from '@/types/marketing';
import { cn } from '@/lib/shared/utils';

// ──────────────────────────────────────────────────────────────────
// SECTION GRID CONFIG
// soft + fade-top → cards float at top, grid grounds the section below
// ──────────────────────────────────────────────────────────────────
const GRID = createGridStyle({ intensity: 'soft', mask: 'fade-top' });

export async function PricingSection() {
  const tMarketing = await getTranslations('marketing.pricing');
  const tSub = await getTranslations('dashboard.subscription');

  const freeForeverNote = tSub('plans.FREE.priceNote');
  const showComingSoon = !FEATURES.digitalProducts;

  return (
    <section
      id="pricing"
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
            <SectionEyebrow>{tMarketing('eyebrow')}</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {tMarketing('headline')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {tMarketing('subheadline')}
            </p>
          </div>
        </div>

        {/* BLOCK B — PRICING COLUMNS */}
        <div className="relative mx-auto mt-8 max-w-6xl border-y bg-background md:mt-10">
          <CornerCrosses />
          <div className="grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
            {pricingTiers.map((tier) => {
              const tierId = tier.id as MarketingTier;
              const priceNote = tSub(`plans.${tierId}.priceNote`);

              const featuresRaw = tSub.raw(`plans.${tierId}.features`);
              const features = Array.isArray(featuresRaw)
                ? (featuresRaw as string[])
                : [];

              const digitalFeaturesRaw = tSub.raw(
                `plans.${tierId}.digitalFeatures`,
              );
              const digitalFeatures = Array.isArray(digitalFeaturesRaw)
                ? (digitalFeaturesRaw as string[])
                : [];

              const isFreeForever = priceNote === freeForeverNote;

              return (
                <div key={tier.id} className="relative">
                  {tier.highlighted && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center">
                      <span className="-translate-y-1/2 bg-foreground px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-background">
                        {tMarketing('popularBadge')}
                      </span>
                    </div>
                  )}

                  <PricingCard
                    name={tSub(`plans.${tierId}.name`)}
                    price={tSub(`plans.${tierId}.price`)}
                    priceNote={isFreeForever ? '' : priceNote}
                    dotColor={tier.dotColor}
                    platformFee={tier.platformFee}
                    features={features}
                    digitalFeatures={digitalFeatures}
                    highlighted={tier.highlighted}
                    digitalGated={showComingSoon}
                    labels={{
                      comingSoonSection: tSub('comingSoon.sectionLabel'),
                      platformFeeLabel: tSub('platformFee.label'),
                    }}
                    footnote={isFreeForever ? freeForeverNote : undefined}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Roadmap note — sits outside blocks (footnote, ambient grid behind) */}
        <div className="mx-auto mt-8 max-w-3xl">
          <p className="text-center text-sm leading-relaxed text-muted-foreground">
            {tMarketing('roadmapNote')}
          </p>
        </div>
      </div>
    </section>
  );
}