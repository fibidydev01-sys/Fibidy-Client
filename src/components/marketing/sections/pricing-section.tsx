// ==========================================
// PRICING SECTION (3-tier mirror of subscription dashboard)
// File: src/components/marketing/sections/pricing-section.tsx
//
// [PHASE 4 — May 2026]
//
// Q18 — 3-card grid restored.
//   Renders FREE / STARTER / BUSINESS cards via <PricingCard>, the
//   primitive preserved through Phase 2's single-panel detour.
//
// Q19 — Coming Soon labels mirror subscription dashboard exactly.
//   This section reads its tier names, prices, feature lists, and
//   coming-soon labels from the SAME i18n namespace
//   (`dashboard.subscription.*`) that the post-login subscription
//   page uses. Zero drift between pre-login marketing and post-login
//   dashboard:
//
//     dashboard.subscription.plans.{FREE|STARTER|BUSINESS}
//       .name             → tier title
//       .price            → big price label
//       .priceNote        → "/month" inline OR "Forever free" footnote
//       .features         → globally-available features (always checked)
//       .digitalFeatures  → digital-only features (Coming Soon panel)
//
//     dashboard.subscription.comingSoon.sectionLabel
//                          → "Coming Soon" / "Segera Hadir"
//     dashboard.subscription.platformFee.label
//                          → "Platform fee" / "Biaya platform"
//
//   Marketing-specific chrome (eyebrow, headline, subheadline,
//   roadmap note) stays under `marketing.pricing.*` — those are
//   sales/positioning copy that doesn't belong in the dashboard.
//
// FREE plan rendering quirk (preserved from subscription page):
//   - `priceNote` is "Forever free" / "Gratis selamanya"
//   - We DON'T show this inline next to the price (would read awkward:
//     "Rp 0 Forever free")
//   - Instead it goes into PricingCard's `footnote` prop so it
//     appears as muted small text BELOW the price
//   - STARTER + BUSINESS show their `priceNote` inline normally
//     ("Rp 35.000 /month")
//
// FEATURES.digitalProducts gate:
//   - OFF (current default) → digital features render in grouped
//     Coming Soon panel with Lock icons + the platform fee folded in.
//     Behavior identical to subscription page when same flag is OFF.
//   - ON → digital features render alongside global features as
//     normal checked items, platform fee gets its own muted box.
//
// Server component — no interactivity, no client hooks. The reactive
// gating happens at module import time via FEATURES constant.
// ==========================================

import { getTranslations } from 'next-intl/server';
import { SectionShell } from '@/components/marketing/shared/section-shell';
import { SectionEyebrow } from '@/components/marketing/shared/section-eyebrow';
import { PricingCard } from '@/components/marketing/shared/pricing-card';
import { pricingTiers } from '@/lib/data/marketing/pricing';
import { FEATURES } from '@/lib/config/features';
import type { MarketingTier } from '@/types/marketing';

export async function PricingSection() {
  // Marketing chrome (eyebrow, headline, subheadline, roadmap note)
  const tMarketing = await getTranslations('marketing.pricing');
  // [Q19] Tier copy + Coming Soon labels — mirror of subscription dashboard
  const tSub = await getTranslations('dashboard.subscription');

  // FREE plan's priceNote is the "Forever free" label, shown as a
  // footnote (not inline). Comparing to this string lets us decide
  // whether to suppress the inline priceNote on FREE.
  const freeForeverNote = tSub('plans.FREE.priceNote');

  const showComingSoon = !FEATURES.digitalProducts;

  return (
    <SectionShell id="pricing" bgClassName="bg-muted/30">
      {/* Section header */}
      <div className="mx-auto max-w-3xl text-center">
        <SectionEyebrow>{tMarketing('eyebrow')}</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {tMarketing('headline')}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {tMarketing('subheadline')}
        </p>
      </div>

      {/* 3-card grid — equal-height via auto-rows-fr + flex-col in PricingCard */}
      <div className="mx-auto mt-12 grid max-w-6xl auto-rows-fr grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:items-stretch">
        {pricingTiers.map((tier) => {
          const tierId = tier.id as MarketingTier;
          const priceNote = tSub(`plans.${tierId}.priceNote`);

          // Defensive .raw() — if i18n drifts and `features` is missing
          // or malformed, fall back to empty array rather than crashing.
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

          // FREE: "Forever free" → footnote, not inline.
          // Others: "/month" → inline next to price.
          const isFreeForever = priceNote === freeForeverNote;

          return (
            <PricingCard
              key={tier.id}
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
          );
        })}
      </div>

      {/* Roadmap note — marketing-specific positioning copy, kept under
          marketing.pricing.* (NOT mirrored from dashboard). Soft amber
          accent matches subscription page's coming-soon panel hue. */}
      <div className="mx-auto mt-8 max-w-3xl">
        <p className="text-center text-sm leading-relaxed text-muted-foreground">
          {tMarketing('roadmapNote')}
        </p>
      </div>
    </SectionShell>
  );
}
