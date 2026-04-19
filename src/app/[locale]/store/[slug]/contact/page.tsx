import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { tenantsApi } from '@/lib/api/tenants';
import { TenantContact } from '@/components/store/contact/tenant-contact';

// ==========================================
// STORE CONTACT PAGE
// File: src/app/[locale]/store/[slug]/contact/page.tsx
//
// [i18n FIX — 2026-04-19]
// Metadata title for both "found" and "not found" branches sourced from
// JSON:
//   - Not found fallback: `store.metadata.notFound`
//   - Found:              `store.metadata.contactTitle` with `{tenant}` slot
// Same pattern as the about page sibling.
// ==========================================

interface ContactPageProps {
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
}: ContactPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tenant = await getTenant(slug);
  const t = await getTranslations({ locale, namespace: 'store.metadata' });

  if (!tenant) {
    return { title: t('notFound') };
  }
  return { title: t('contactTitle', { tenant: tenant.name }) };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { slug } = await params;
  const tenant = await getTenant(slug);

  if (!tenant) notFound();

  return <TenantContact tenant={tenant!} />;
}