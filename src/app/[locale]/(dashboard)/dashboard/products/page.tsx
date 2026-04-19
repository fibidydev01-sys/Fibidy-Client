// ==========================================
// PRODUCTS PAGE
// File: src/app/[locale]/(dashboard)/dashboard/products/page.tsx
//
// [i18n FIX — 2026-04-19]
// Static `metadata` replaced with async `generateMetadata`.
// ==========================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DashboardClient } from './client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard.metadata' });
  return {
    title: t('productsTitle'),
    description: t('productsDescription'),
  };
}

export default function DashboardPage() {
  return <DashboardClient />;
}