// ==========================================
// LIBRARY PAGE
// File: src/app/[locale]/(dashboard)/dashboard/library/page.tsx
//
// [i18n FIX — 2026-04-19]
// Static `metadata` replaced with async `generateMetadata` using
// `getTranslations` (server-side next-intl API). Same pattern as
// `(admin)/layout.tsx` and `admin/login/page.tsx`.
// ==========================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LibraryClient } from './client';

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
  return <LibraryClient />;
}