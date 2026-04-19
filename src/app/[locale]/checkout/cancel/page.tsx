// ==========================================
// CHECKOUT CANCEL PAGE
// File: src/app/[locale]/checkout/cancel/page.tsx
//
// [i18n FIX — 2026-04-19]
// Static `metadata` replaced with async `generateMetadata` using
// `checkout.metadata.cancelTitle`.
// ==========================================

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { CheckoutCancelClient } from './client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout.metadata' });
  return {
    title: t('cancelTitle'),
  };
}

export default function CheckoutCancelPage() {
  return (
    <Suspense>
      <CheckoutCancelClient />
    </Suspense>
  );
}