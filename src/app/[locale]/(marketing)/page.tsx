// ==========================================
// MARKETING PAGE (root /)
// File: src/app/[locale]/(marketing)/page.tsx
//
// [HANDSFREE COMPOSER]
// This file does ONE job: map the DEFAULT_SECTIONS array from
// lib/data/marketing/sections.ts to actual React components via
// the REGISTRY object below.
//
// Editing copy, swapping order, or toggling a section never
// requires touching this file. Adding a brand new section (e.g.
// 'logos', 'testimonials' down the line):
//   1. Build the section component
//   2. Add it to REGISTRY here
//   3. Add the SectionKey to types/marketing.ts
//   4. Add the key to DEFAULT_SECTIONS in sections.ts
//
// Phase 3 (Interactive Store Builder, May 2026):
//   - REGISTRY swap: 'howItWorks' → 'storeBuilder'
//   - HowItWorksSection import deleted; the file itself is
//     deleted in Phase 3 (see README.md Step 1)
//
// generateMetadata reads marketing.metadata.* from i18n. Title and
// description are locale-aware; OG image inheritance from the root
// layout still applies.
// ==========================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { SectionKey } from '@/types/marketing';
import { DEFAULT_SECTIONS } from '@/lib/data/marketing/sections';

import { AnnouncementBar } from '@/components/marketing/sections/announcement-bar';
import { HeroSection } from '@/components/marketing/sections/hero-section';
import { ProblemSection } from '@/components/marketing/sections/problem-section';
import { FeaturesSection } from '@/components/marketing/sections/features-section';
import { PricingSection } from '@/components/marketing/sections/pricing-section';
import { StoreBuilderSection } from '@/components/marketing/sections/store-builder-section';
import { FaqSection } from '@/components/marketing/sections/faq-section';
import { FinalCtaSection } from '@/components/marketing/sections/final-cta-section';

// Registry: SectionKey → component. Every key in SectionKey must
// have an entry here. TypeScript will complain if we miss one
// thanks to `Record<SectionKey, …>`.
const REGISTRY: Record<SectionKey, React.ComponentType> = {
  announcement: AnnouncementBar,
  hero: HeroSection,
  problem: ProblemSection,
  features: FeaturesSection,
  pricing: PricingSection,
  storeBuilder: StoreBuilderSection,
  faq: FaqSection,
  finalCta: FinalCtaSection,
};

// ==========================================
// METADATA
// ==========================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'marketing.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

// ==========================================
// PAGE
// ==========================================

export default function MarketingPage() {
  return (
    <>
      {DEFAULT_SECTIONS.map((key) => {
        const Component = REGISTRY[key];
        return <Component key={key} />;
      })}
    </>
  );
}
