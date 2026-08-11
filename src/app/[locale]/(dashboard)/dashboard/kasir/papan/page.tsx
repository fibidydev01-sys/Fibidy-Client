// ==========================================
// PAPAN KERJA PAGE
// File: src/app/[locale]/(dashboard)/dashboard/kasir/papan/page.tsx
// ==========================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { KasirPlanGate } from '@/components/dashboard/kasir/kasir-plan-gate';
import { PapanClient } from './client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard.metadata' });
  return { title: t('papanTitle') };
}

export default function PapanPage() {
  return (
    <KasirPlanGate>
      <PapanClient />
    </KasirPlanGate>
  );
}
