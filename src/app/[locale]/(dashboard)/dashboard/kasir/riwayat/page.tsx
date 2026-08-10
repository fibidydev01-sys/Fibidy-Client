// ==========================================
// RIWAYAT KASIR PAGE
// File: src/app/[locale]/(dashboard)/dashboard/kasir/riwayat/page.tsx
// ==========================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { KasirPlanGate } from '@/components/dashboard/kasir/kasir-plan-gate';
import { RiwayatClient } from './client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard.metadata' });
  return { title: t('riwayatTitle') };
}

export default function RiwayatPage() {
  return (
    <KasirPlanGate>
      <RiwayatClient />
    </KasirPlanGate>
  );
}
