// ============================================================================
// AUTH LAYOUT — Next.js Route Layout
// File: src/app/[locale]/(auth)/layout.tsx
//
// [PHASE F · SPRINT 3 — May 2026]
// Tambah <OfflineBanner /> — user di register/login form juga butuh tahu
// kalau offline sebelum mencoba submit.
//
// [VERCEL VIBES — May 2026]
// GuestGuard wrap REMOVED. Auth-based redirects handled by edge proxy
// at src/proxy.ts step 5.
//
// [i18n FIX — 2026-04-19]
// Metadata via async generateMetadata using getTranslations.
// ============================================================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { OfflineBanner } from '@/components/layout/dashboard/offline-banner';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.metadata' });

  return {
    title: {
      template: t('layoutTemplate'),
      default: t('layoutDefault'),
    },
  };
}

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    // [UI/UX — Aug 2026] flex min-h-svh flex-col — OfflineBanner and
    // {children} now share ONE min-h-svh budget. Previously OfflineBanner
    // sat above a plain fragment, and {children} (register/page.tsx's own
    // grid, or auth-layout.tsx's) independently claimed ITS OWN
    // min-h-svh — so whenever the banner showed, the page needed
    // banner-height + one full viewport, always overflowing the actual
    // viewport by exactly the banner's height. That's what was clipping
    // the register wizard's sticky footer off the bottom of the screen.
    // {children}'s own grid must be `flex-1` (not `min-h-svh`) for this
    // to actually fix it — see register/page.tsx and auth-layout.tsx.
    <div className="flex min-h-svh flex-col">
      {/* [SPRINT 3] Offline banner — user perlu tahu offline sebelum submit form */}
      <OfflineBanner />
      {children}
    </div>
  );
}