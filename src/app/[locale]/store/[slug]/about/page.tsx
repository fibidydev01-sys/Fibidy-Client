import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { tenantsApi } from '@/lib/api/tenants';
import { TenantAbout } from '@/components/store/about/tenant-about';

// ==========================================
// STORE ABOUT PAGE
// File: src/app/[locale]/store/[slug]/about/page.tsx
//
// [i18n FIX — 2026-04-19]
// Metadata title for both the "found" and "not found" branches is now
// sourced from JSON:
//   - Not found fallback: `store.metadata.notFound`
//   - Found:              `store.metadata.aboutTitle` with `{tenant}` slot
//
// The JSON template already formats as "About Us | {tenant}", so the
// name appears in the expected SERP slot. If a future locale needs a
// different ordering (e.g. "{tenant} | Tentang Kami" for Indonesian),
// it's a JSON-level edit.
// ==========================================

interface AboutPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

async function getTenant(slug: string) {
  try {
    return await tenantsApi.getBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tenant = await getTenant(slug);
  const t = await getTranslations({ locale, namespace: 'store.metadata' });

  if (!tenant) {
    return { title: t('notFound') };
  }
  return { title: t('aboutTitle', { tenant: tenant.name }) };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { slug } = await params;
  const tenant = await getTenant(slug);
  if (!tenant) notFound();

  return <TenantAbout features={tenant!.aboutFeatures || []} />;
}