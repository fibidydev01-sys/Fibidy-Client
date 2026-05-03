// ==========================================
// MARKETING PAGE (root /)
// File: src/app/[locale]/(marketing)/page.tsx
//
// [VERCEL VIBES — May 2026]
// The canonical landing page for unauthenticated visitors at `/`.
// Authed users never reach this route — the edge proxy intercepts and
// 307s them to /<locale>/dashboard/products before this RSC ever runs.
//
// i18n keys required (see json-patch.md):
//   marketing.metadata.title
//   marketing.metadata.description
// ==========================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MarketingHero } from '@/components/marketing/marketing-hero';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'marketing.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

interface MarketingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function MarketingPage({ params }: MarketingPageProps) {
  const { locale } = await params;

  return <MarketingHero locale={locale} />;
}
