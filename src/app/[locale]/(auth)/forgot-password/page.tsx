// ==========================================
// FORGOT PASSWORD PAGE
// File: src/app/[locale]/(auth)/forgot-password/page.tsx
//
// [NATIVE MOBILE VIBES — May 2026]
// AuthLayout sekarang render tombol back native (← Kembali Login) di pojok kiri atas.
// Prop `backLabel` dan `backHref` diteruskan ke AuthLayout.
// ==========================================

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { AuthLayout } from '@/components/layout/auth/auth-layout';
import { ForgotPasswordForm } from '@/components/auth/forgot-password/forgot-password';
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
    title: t('forgotPasswordTitle'),
    description: t('forgotPasswordDescription'),
  };
}

// ==========================================
// LOADING SKELETON
// ==========================================

function ForgotPasswordFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-28 mx-auto" />
    </div>
  );
}

// ==========================================
// COMING SOON BADGE
// ==========================================

function ComingSoonBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-500">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
      </span>
      {label}
    </span>
  );
}

// ==========================================
// PAGE COMPONENT
// ==========================================

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.forgotPassword' });

  return (
    <AuthLayout
      title={t('title')}
      badge={<ComingSoonBadge label={t('comingSoonBadge')} />}
      image="/auth-picture/auth-forgot-password.jpg"
      imageAlt={t('imageAlt')}
      backLabel={t('backLabel')}
      backHref="/login"
    >
      <Suspense fallback={<ForgotPasswordFormSkeleton />}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}