// ==========================================
// AUTH LAYOUT
// File: src/app/[locale]/(auth)/layout.tsx
//
// [VERCEL VIBES — May 2026]
// `<GuestGuard>` wrap REMOVED. Auth-based redirects (authed user hitting
// /login etc. → bounce to dashboard) are now handled by the edge proxy
// at src/proxy.ts step 5. The client-side guard caused a flash where
// the login form would briefly render before the redirect fired.
//
// GuestGuard component itself still exists in
// `components/layout/auth/auth-guard.tsx` in case other surfaces need
// client-side guarding, but it is no longer used by the auth pages.
//
// [i18n FIX — 2026-04-19]
// Static `metadata` export replaced with async `generateMetadata` using
// `getTranslations` (server-side next-intl API). Same pattern as
// `(admin)/layout.tsx`.
//
// Requires JSON keys (already in lockfile from the i18n migration):
//   - auth.metadata.layoutTemplate
//   - auth.metadata.layoutDefault
// ==========================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

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
  return <>{children}</>;
}
