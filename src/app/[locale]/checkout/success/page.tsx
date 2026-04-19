// ==========================================
// CHECKOUT SUCCESS PAGE
// File: src/app/[locale]/checkout/success/page.tsx
//
// [i18n FIX — 2026-04-19]
// Static `metadata` replaced with async `generateMetadata` using
// `checkout.metadata.successTitle` and `checkout.metadata.successDescription`.
// ==========================================

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { CheckoutSuccessClient } from './client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout.metadata' });
  return {
    title: t('successTitle'),
    description: t('successDescription'),
  };
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessClient />
    </Suspense>
  );
}