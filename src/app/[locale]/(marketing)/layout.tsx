// ==========================================
// MARKETING LAYOUT
// File: src/app/[locale]/(marketing)/layout.tsx
//
// [VERCEL VIBES — May 2026]
// Wraps every (marketing) route with header + footer. Currently only
// hosts `page.tsx` (the root /), but the route group is set up so future
// public pages (/pricing, /about, /features) drop in without
// re-plumbing the chrome.
//
// No GuestGuard is needed — the edge proxy at src/proxy.ts step 5 ALREADY
// redirects authed users away from `/` to `/<locale>/dashboard/products`.
// By the time a request reaches this layout, the user is guaranteed to
// be unauthenticated (or the redirect is in flight via the optimistic
// fall-through — see proxy.ts header comment for details).
// ==========================================

import type { ReactNode } from 'react';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';

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
    <div className="min-h-screen flex flex-col">
      <MarketingHeader locale={locale} />
      <main className="flex-1">{children}</main>
      <MarketingFooter locale={locale} />
    </div>
  );
}
