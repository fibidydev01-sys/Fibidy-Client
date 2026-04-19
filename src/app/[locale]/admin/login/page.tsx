// ==========================================
// ADMIN LOGIN PAGE
// File: src/app/[locale]/admin/login/page.tsx
//
// NOTE: Ini di luar route group (admin)
// karena login tidak butuh AdminGuard
//
// [i18n FIX — 2026-04-19]
// Static `metadata` export replaced with async `generateMetadata`
// so the browser tab title can be translated via `auth.metadata.adminLoginTitle`.
// `robots: 'noindex, nofollow'` kept — admin login must never be indexed
// regardless of locale.
// ==========================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AdminLoginClient } from './client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.metadata' });

  return {
    title: t('adminLoginTitle'),
    robots: 'noindex, nofollow',
  };
}

export default function AdminLoginPage() {
  return <AdminLoginClient />;
}