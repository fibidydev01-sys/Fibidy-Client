// ==========================================
// MARKETING PAGE (root /)
// File: src/app/[locale]/(marketing)/page.tsx
//
// [MINIMAL MODE — May 2026]
// Page reduced to two sections only:
//   - StoreBuilder  → conversion engine (try-it, pre-fill, sign up)
//   - FinalCta      → close
//
// All other sections are temporarily DISABLED but the imports +
// REGISTRY entries are preserved as TODO comments so we can flip
// them back on with a single uncomment + edit to ACTIVE_SECTIONS.
//
// To re-enable everything: replace ACTIVE_SECTIONS with
// DEFAULT_SECTIONS from '@/lib/data/marketing/sections'.
//
// generateMetadata reads marketing.metadata.* from i18n. Title and
// description are locale-aware; OG image inheritance from the root
// layout still applies.
// ==========================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { SectionKey } from '@/types/marketing';

// ── ACTIVE imports ──────────────────────────────────────────────
import { StoreBuilderSection } from '@/components/marketing/sections/store-builder-section';
import { FinalCtaSection } from '@/components/marketing/sections/final-cta-section';

// ── DISABLED imports (TODO: re-enable when bringing back full page) ──
// TODO: import { AnnouncementBar } from '@/components/marketing/sections/announcement-bar';
// TODO: import { HeroSection } from '@/components/marketing/sections/hero-section';
// TODO: import { ProblemSection } from '@/components/marketing/sections/problem-section';
// TODO: import { FeaturesSection } from '@/components/marketing/sections/features-section';
// TODO: import { ScaleSection } from '@/components/marketing/sections/scale-section';
// TODO: import { HowItWorksSection } from '@/components/marketing/sections/how-it-works-section';
// TODO: import { PricingSection } from '@/components/marketing/sections/pricing-section';
// TODO: import { FaqSection } from '@/components/marketing/sections/faq-section';

// ──────────────────────────────────────────────────────────────────
// SECTION REGISTRY
//
// Only the two active sections are mapped. The disabled ones live in
// the commented block below — uncomment + add their key into
// ACTIVE_SECTIONS to bring them back online.
// ──────────────────────────────────────────────────────────────────

const REGISTRY: Partial<Record<SectionKey, React.ComponentType>> = {
  storeBuilder: StoreBuilderSection,
  finalCta: FinalCtaSection,

  // TODO: re-enable when bringing back the full marketing page
  // announcement: AnnouncementBar,
  // hero: HeroSection,
  // problem: ProblemSection,
  // features: FeaturesSection,
  // scale: ScaleSection,
  // howItWorks: HowItWorksSection,
  // pricing: PricingSection,
  // faq: FaqSection,
};

// ──────────────────────────────────────────────────────────────────
// ACTIVE SECTIONS — render order
//
// Minimal mode: just two sections, in this order. To restore the
// full page, swap this array for DEFAULT_SECTIONS imported from
// '@/lib/data/marketing/sections'.
// ──────────────────────────────────────────────────────────────────

const ACTIVE_SECTIONS: readonly SectionKey[] = [
  'storeBuilder',
  'finalCta',
] as const;

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
      {ACTIVE_SECTIONS.map((key) => {
        const Component = REGISTRY[key];
        if (!Component) return null;
        return <Component key={key} />;
      })}
    </>
  );
}