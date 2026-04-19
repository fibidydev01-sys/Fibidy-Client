// ==========================================
// DISCOVER LIST PAGE
// File: src/app/[locale]/discover/page.tsx
//
// [i18n FIX — 2026-04-19]
// Static `metadata` replaced with async `generateMetadata` using
// `discover.metadata.listTitle` and `discover.metadata.listDescription`.
// ==========================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DiscoverClient } from './client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'discover.metadata' });

  return {
    title: t('listTitle'),
    description: t('listDescription'),
  };
}

export default function DiscoverPage() {
  return <DiscoverClient />;
}