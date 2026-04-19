// ==========================================
// AUTH LAYOUT
// File: src/app/[locale]/(auth)/layout.tsx
//
// Applies GuestGuard to all auth pages.
//
// [i18n FIX — 2026-04-19]
// Static `metadata` export replaced with async `generateMetadata` using
// `getTranslations` (server-side next-intl API). Same pattern as
// `(admin)/layout.tsx`.
//
// Requires NEW JSON keys — see `00-JSON-PATCH--auth-metadata.md`:
//   - auth.metadata.layoutTemplate
//   - auth.metadata.layoutDefault
//
// Without those two keys, this page will render with
// "MISSING_MESSAGE" fallbacks from next-intl.
// ==========================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { GuestGuard } from '@/components/layout/auth/auth-guard';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.metadata' });

  return {
    title: {
      template: t('layoutTemplate'),
      default: t('layoutDefault'),
    },
  };
}

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <GuestGuard redirectTo="/dashboard/products">
      {children}
    </GuestGuard>
  );
}