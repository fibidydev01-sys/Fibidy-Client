// ==========================================
// MARKETING LAYOUT
// File: src/app/[locale]/(marketing)/layout.tsx
//
// [VERCEL VIBES — May 2026 REBUILD]
// Wraps every (marketing) route with:
//   - LenisProvider                  → global smooth scroll (marketing only)
//   - MarketingSchema                → FAQPage + SoftwareApplication JSON-LD
//   - MarketingOnboardingProvider    → NextStep.js tours (Phase 5 v3)
//   - MarketingHeader                → sticky nav (locale/theme NOT here)
//   - <main>                         → section composition rendered by page.tsx
//   - MarketingFooter                → 4 columns + bottom-bar
//
// Phase 5 polish v3 (May 2026 — NextStep onboarding):
//
// Added <MarketingOnboardingProvider> wrapping the entire marketing
// chrome. It internally mounts NextStep.js's NextStepProvider +
// NextStep + supplies tours scoped to the marketing route group.
//
// Bundle split: this provider only loads when a user visits a
// (marketing) route. The (dashboard) route group will get its own
// provider with its own tours when needed — no cross-pollution.
//
// useNextStep() hook is now usable in any client component within
// the marketing route group (StoreBuilder section uses it to fire
// the category-gate tour from SubdomainInput's toast action).
//
// No GuestGuard needed — the edge proxy at src/proxy.ts step 5
// already redirects authed users to /dashboard/products before
// requests reach this layout.
// ==========================================

import type { ReactNode } from 'react';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { LenisProvider } from '@/components/marketing/shared/lenis-provider';
import { MarketingSchema } from '@/components/marketing/shared/marketing-schema';
import { MarketingOnboardingProvider } from '@/lib/data/marketing/tours';

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

      <MarketingOnboardingProvider>
        <div className="flex min-h-screen flex-col">
          <MarketingHeader />
          <main className="flex-1">{children}</main>
          <MarketingFooter locale={locale} />
        </div>
      </MarketingOnboardingProvider>
    </>
  );
}
