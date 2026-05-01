// ==========================================
// DOWNLOAD HISTORY PAGE
// File: src/app/[locale]/(dashboard)/dashboard/products/downloads/page.tsx
//
// [PHASE 3] When FEATURES.digitalProducts is false, this page renders
// <ComingSoonPage /> server-side instead of mounting DownloadHistoryClient.
//
// [i18n FIX — 2026-04-19]
// Static `metadata` replaced with async `generateMetadata`.
// ==========================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DownloadHistoryClient } from './client';
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
    title: t('downloadsTitle'),
    description: t('downloadsDescription'),
  };
}

export default function DownloadHistoryPage() {
  if (!FEATURES.digitalProducts) {
    return <ComingSoonPage feature="digitalProducts" ctaHref="/dashboard/products" />;
  }
  return <DownloadHistoryClient />;
}
