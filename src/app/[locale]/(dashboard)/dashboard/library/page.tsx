// ==========================================
// LIBRARY PAGE
// File: src/app/[locale]/(dashboard)/dashboard/library/page.tsx
//
// [PHASE 3] When FEATURES.digitalProducts is false, this page renders
// <ComingSoonPage /> server-side instead of mounting LibraryClient.
// This avoids a flash of broken content + saves a 503 round trip.
//
// BUYER role (where /dashboard/library was their main destination)
// gets force-redirected to /dashboard/setup-store by DashboardRouteGuard
// before this even renders, so this fallback is mainly for SELLER users
// who manually navigate or hit a stale link.
//
// [i18n FIX — 2026-04-19]
// Static `metadata` replaced with async `generateMetadata` using
// `getTranslations` (server-side next-intl API). Same pattern as
// `(admin)/layout.tsx` and `admin/login/page.tsx`.
// ==========================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LibraryClient } from './client';
import { FEATURES } from '@/lib/config/features';
import { ComingSoonPage } from '@/components/shared/coming-soon-page';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard.metadata' });
  return {
    title: t('libraryTitle'),
    description: t('libraryDescription'),
  };
}

export default function LibraryPage() {
  if (!FEATURES.digitalProducts) {
    return <ComingSoonPage feature="library" ctaHref="/dashboard/products" />;
  }
  return <LibraryClient />;
}
