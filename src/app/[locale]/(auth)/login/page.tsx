// ==========================================
// LOGIN PAGE
// File: src/app/[locale]/(auth)/login/page.tsx
//
// [TIDUR-NYENYAK FIX #5] Added <LoginPageBanner />
// Reads ?reason=password_changed|session_expired and shows
// user-friendly explanation above login form.
//
// [i18n FIX — 2026-04-19]
// Two things change:
//
// 1. Static `metadata` → async `generateMetadata` using `getTranslations`
//    (namespace `auth.metadata`). Reuses existing keys `loginTitle` and
//    `loginDescription`.
//
// 2. The page passes `title`, `description`, `image`, `imageAlt` props to
//    the AuthLayout component. Because this file is a server component
//    (no 'use client'), it can't call `useTranslations()` directly — hooks
//    only work inside client components. Instead we `await getTranslations()`
//    at the top of the async default export and pass the resolved strings
//    as plain props. AuthLayout itself keeps its existing props contract
//    (string | undefined); no changes needed there.
//
// The `image="/auth-picture/auth-login.jpg"` path stays hardcoded — image
// filenames are assets, not translatable copy. If Phase 2 ever introduces
// locale-specific illustrations, we'd move this into the JSON alongside
// `imageAlt`.
// ==========================================

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { AuthLayout } from '@/components/layout/auth/auth-layout';
import { LoginForm } from '@/components/auth/login/login';
import { LoginPageBanner } from './banner';
import { Skeleton } from '@/components/ui/skeleton';

// ==========================================
// METADATA
// ==========================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.metadata' });

  return {
    title: t('loginTitle'),
    description: t('loginDescription'),
  };
}

// ==========================================
// LOADING SKELETON
// ==========================================

function LoginFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  );
}

// ==========================================
// PAGE COMPONENT
// ==========================================

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.login' });

  return (
    <AuthLayout
      title={t('title')}
      description={t('subtitle')}
      image="/auth-picture/auth-login.jpg"
      imageAlt={t('imageAlt')}
    >
      {/* [FIX #5] Banner reads ?reason= param */}
      <Suspense fallback={null}>
        <LoginPageBanner />
      </Suspense>

      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}