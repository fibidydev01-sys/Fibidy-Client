// ==========================================
// MARKETING LAYOUT
// File: src/app/[locale]/(marketing)/layout.tsx
//
// [VERCEL VIBES — May 2026 REBUILD]
// Wraps every (marketing) route with:
//   - LenisProvider     → global smooth scroll (marketing only)
//   - MarketingSchema   → FAQPage + SoftwareApplication JSON-LD
//   - MarketingHeader   → sticky nav (locale/theme NOT here)
//   - <main>            → section composition rendered by page.tsx
//   - MarketingFooter   → 4 columns + bottom-bar with locale + theme
//
// No GuestGuard needed — the edge proxy at src/proxy.ts step 5
// already redirects authed users to /dashboard/products before
// requests reach this layout. Anyone hitting `/` here is guaranteed
// to be unauthenticated.
//
// Locale comes from the route segment param. Phase 1: 'en' and 'id'.
// MarketingSchema reads the locale to pick the right JSON-LD copy.
// ==========================================

import type { ReactNode } from 'react';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { LenisProvider } from '@/components/marketing/shared/lenis-provider';
import { MarketingSchema } from '@/components/marketing/shared/marketing-schema';

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

      <div className="flex min-h-screen flex-col">
        <MarketingHeader />
        <main className="flex-1">{children}</main>
        <MarketingFooter locale={locale} />
      </div>
    </>
  );
}
