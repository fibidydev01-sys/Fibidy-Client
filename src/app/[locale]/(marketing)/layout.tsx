// ==========================================
// MARKETING LAYOUT
// File: src/app/[locale]/(marketing)/layout.tsx
//
// Phase 9 (May 2026 — onboarding co-location):
//
// CHANGED in Phase 9:
//   - Tour provider import path: '@/lib/data/marketing/tours' →
//     '@/lib/marketing/onboarding/tour-provider'
//   - Component name: MarketingOnboardingProvider →
//     MarketingTourProvider (renamed for symmetry with tour-config /
//     tour-names siblings)
//
// PRESERVED FROM PRE-PHASE-9:
//   - LenisProvider mount (smooth scroll, marketing route group only)
//   - MarketingSchema (FAQPage + SoftwareApplication JSON-LD)
//   - MarketingHeader / MarketingFooter chrome
//   - Outer fragment + flex column structure
//   - Locale prop forwarded to MarketingFooter
//
// WHY THE PROVIDER WRAPS CHROME:
//   useNextStep() must work inside any descendant client component.
//   Wrapping the entire chrome (header + main + footer) means a
//   future header CTA tour OR a footer link spotlight tour both
//   work without re-wiring the provider tree.
//
// BUNDLE NOTE:
//   The tour provider only loads on (marketing) routes. The (dashboard)
//   route group will mount its own parallel provider with its own tour
//   bundle — no cross-pollination, every route group ships only what
//   it needs.
// ==========================================

import type { ReactNode } from 'react';
import { MarketingHeader } from '@/components/marketing/layout/header';
import { MarketingFooter } from '@/components/marketing/layout/footer';
import { LenisProvider } from '@/components/marketing/layout/lenis-provider';
import { MarketingSchema } from '@/components/marketing/layout/seo-schema';
import { MarketingTourProvider } from '@/lib/marketing/onboarding/tour-provider';

interface MarketingLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function MarketingLayout({
  children,
  params,
}: MarketingLayoutProps) {
  const { locale } = await params;

  return (
    <>
      <LenisProvider />
      <MarketingSchema locale={locale} />

      <MarketingTourProvider>
        <div className="flex min-h-screen flex-col">
          <MarketingHeader />
          <main className="flex-1">{children}</main>
          <MarketingFooter locale={locale} />
        </div>
      </MarketingTourProvider>
    </>
  );
}
