// ==========================================
// STORE BUILDER SECTION
// File: src/components/marketing/sections/store-builder/index.tsx
//
// [VISUAL SYNC v4 — May 2026]
//
// Pattern visual = Hero (eyebrow pill + WordRotate headline + subheadline)
// Fungsi = StoreBuilder tetap (slug input + agreement + CTA form).
//
// Labels dikembalikan ke storeBuilder i18n untuk copy yang relevan,
// headlinePrefix + morphWords dari hero (visual match).
//
// [BORDER FIX — May 2026]
// Tambah ctaSecondary + secondaryHref ke labels supaya secondary button
// "See the demo" / "Lihat demo" muncul di StoreBuilder sama seperti Hero.
// secondaryHref pakai '#hero' supaya scroll ke Hero section.
// ==========================================

import { getTranslations } from 'next-intl/server';
import { SectionShell } from '@/components/marketing/primitives/section-shell';
import {
  StoreBuilderFormIsland,
  type StoreBuilderFormLabels,
} from './form-island';

export async function StoreBuilderSection() {
  const t = await getTranslations('marketing.storeBuilder');
  const tHero = await getTranslations('marketing.hero');

  const morphRaw = tHero.raw('headlineMorph');
  const morphWords: string[] = Array.isArray(morphRaw)
    ? (morphRaw as string[])
    : [String(morphRaw ?? '')];

  const labels: StoreBuilderFormLabels = {
    // Visual chrome — Hero pattern
    eyebrowLabel: t('eyebrow'),
    headlinePrefix: tHero('headlinePrefix'),
    morphWords,
    subheadline: t('subheadline'),
    // Form functional labels — StoreBuilder original
    ctaPrimary: t('ctaPrimary'),
    // Secondary CTA — sama seperti Hero
    ctaSecondary: tHero('ctaSecondary'),
    secondaryHref: '#hero',
    trustLine: t('trustLine'),
  };

  return (
    <SectionShell id="store-builder">
      <StoreBuilderFormIsland labels={labels} />
    </SectionShell>
  );
}