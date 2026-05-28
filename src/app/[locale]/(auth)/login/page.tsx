// ==========================================
// LOGIN PAGE
// File: src/app/[locale]/(auth)/login/page.tsx
//
// [NATIVE MOBILE VIBES — May 2026]
// AuthLayout sekarang render tombol back native (← Kembali) di pojok kiri atas
// menggantikan AuthLogo. Prop `backLabel` diisi via i18n `auth.login.backLabel`.
//
// [TIDUR-NYENYAK FIX #5] Added <LoginPageBanner />
// Reads ?reason=password_changed|session_expired and shows
// user-friendly explanation above login form.
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
      backLabel={t('backLabel')}
      backHref="/"
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