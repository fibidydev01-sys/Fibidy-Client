// ==========================================
// DISCOVER LAYOUT
// File: src/app/[locale]/discover/layout.tsx
//
// [PHASE 3] When FEATURES.digitalProducts is false, layout short-circuits
// with <ComingSoonPage feature="discover" />. All child routes
// (/discover, /discover/[id]) are blocked since they wrap inside this
// layout. AuthDialog also doesn't mount in this state — no need to
// authenticate just to see a coming-soon page.
//
// EDIT: mount <AuthDialog /> once in layout (only when feature enabled)
// AuthDialog is triggered via useAuthDialogStore.open() from buy-button.tsx
//
// [i18n FIX — 2026-04-19]
// Three things change:
//
// 1. Static `metadata` export → async `generateMetadata` using
//    `getTranslations` (namespace `discover.metadata`).
//
// 2. The "Discover" heading inside the minimal layout header is resolved
//    via `getTranslations` at render time and passed through as a plain
//    string. Because layouts run on the server, we can `await` translations
//    directly at the top of the default export.
//
// 3. The params shape changed to `{ locale: string }` to match the
//    `[locale]` route segment. Next.js 16 requires params to be awaited.
// ==========================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AuthDialog } from '@/components/user-auth/auth-dialog';
import { FEATURES } from '@/lib/config/features';
import { ComingSoonPage } from '@/components/shared/coming-soon-page';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'discover.metadata' });

  return {
    title: {
      template: t('layoutTemplate'),
      default: t('layoutDefault'),
    },
  };
}

export default async function DiscoverLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // [PHASE 3] Short-circuit when feature is gated.
  // No header, no auth dialog — just the coming-soon page with a CTA home.
  if (!FEATURES.digitalProducts) {
    return <ComingSoonPage feature="discover" ctaHref="/" ctaLabelKey="backToHome" />;
  }

  const t = await getTranslations({ locale, namespace: 'discover.header' });

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header — doesn't use StoreHeader (that's per tenant) */}
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg">{t('title')}</span>
          {/* Login button — shown when user tries to buy via dialog */}
        </div>
      </header>
      <main>{children}</main>

      {/* Auth Dialog — mounted once, triggered from buy-button */}
      <AuthDialog />
    </div>
  );
}
