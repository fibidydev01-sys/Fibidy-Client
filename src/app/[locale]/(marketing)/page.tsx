// ==========================================
// MARKETING PAGE (root /)
// File: src/app/[locale]/(marketing)/page.tsx
//
// [HANDSFREE COMPOSER]
// This file does ONE job: map the DEFAULT_SECTIONS array from
// lib/data/marketing/sections.ts to actual React components via
// the REGISTRY object below.
//
// Phase 5 polish v15 (May 2026 — Scale section added):
//   - ScaleSection ADDED to REGISTRY. Section key 'scale' is
//     inserted between 'features' and 'howItWorks' in
//     DEFAULT_SECTIONS. The new section renders a Vercel-inspired
//     stacked-browser visual (showing Fibidy subdomains + custom
//     domains) followed by three feature columns: Infinite domains
//     / Instant SSL / Zero maintenance.
//
// Phase 5 polish v2 (May 2026):
//   - HowItWorksSection ADDED to REGISTRY. Section key 'howItWorks'
//     is restored to SectionKey + DEFAULT_SECTIONS (between features
//     and pricing). The section renders a Vercel-style vertical
//     timeline narrating Build → Share → Sell.
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
import { ScaleSection } from '@/components/marketing/sections/scale-section';
import { HowItWorksSection } from '@/components/marketing/sections/how-it-works-section';
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
  scale: ScaleSection,
  howItWorks: HowItWorksSection,
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
