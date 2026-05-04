// ==========================================
// FEATURES SECTION (BENTO GRID)
// File: src/components/marketing/sections/features-section.tsx
//
// 6-tile bento grid. Studio is the flagship (large/2x2 span);
// Stripe + Multi-tenant get wide spans; the rest are 1x1.
//
// CSS Grid:
//   - mobile  → 1 col, all tiles stack
//   - md+     → 4-col grid; tiles use md:col-span-{1|2} + md:row-span-{1|2}
//
// auto-rows-fr keeps the row heights uniform (saasframe.io 2026 guide)
// so the bento doesn't wobble.
//
// Server component — no interactivity needed.
// ==========================================

import { getTranslations } from 'next-intl/server';
import { SectionShell } from '@/components/marketing/shared/section-shell';
import { SectionEyebrow } from '@/components/marketing/shared/section-eyebrow';
import { FeatureTile } from '@/components/marketing/shared/feature-tile';
import { featureTiles } from '@/lib/data/marketing/features';

export async function FeaturesSection() {
  const t = await getTranslations('marketing.features');

  return (
    <SectionShell id="features">
      <div className="mx-auto max-w-3xl text-center">
        <SectionEyebrow>{t('eyebrow')}</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {t('headline')}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {t('subheadline')}
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl auto-rows-fr grid-cols-1 gap-4 md:grid-cols-4 md:gap-5">
        {featureTiles.map((tile) => (
          <FeatureTile
            key={tile.id}
            icon={tile.icon}
            title={t(`items.${tile.id}.title`)}
            description={t(`items.${tile.id}.description`)}
            span={tile.span}
          />
        ))}
      </div>
    </SectionShell>
  );
}
