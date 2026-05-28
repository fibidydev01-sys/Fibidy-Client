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
    <>
      {/* [SPRINT 3] Offline banner — user perlu tahu offline sebelum submit form */}
      <OfflineBanner />
      {children}
    </>
  );
}