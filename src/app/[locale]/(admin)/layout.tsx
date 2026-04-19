// ==========================================
// ADMIN ROUTE GROUP LAYOUT
// File: src/app/[locale]/(admin)/layout.tsx
//
// Pattern IDENTICAL to src/app/[locale]/(dashboard)/layout.tsx
//
// [i18n FIX — 2026-04-19]
// Static `metadata` export swapped for async `generateMetadata` so the
// title template can come from `auth.metadata.layoutTemplate` / `layoutDefault`.
// `robots: 'noindex, nofollow'` stays hardcoded — admin panel must never
// appear in search engines regardless of locale.
// ==========================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AdminLayout } from '@/components/layout/admin/admin-layout';
import { AdminGuard } from '@/components/layout/admin/admin-guard';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.metadata' });

  return {
    title: {
      template: t('layoutTemplate'),
      default: t('layoutDefault'),
    },
    robots: 'noindex, nofollow', // Admin must not be indexed by search engines
  };
}

interface AdminRootLayoutProps {
  children: React.ReactNode;
}

export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}