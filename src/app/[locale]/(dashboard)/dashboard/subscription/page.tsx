// ============================================================================
// SUBSCRIPTION PAGE — SERVER COMPONENT
// File: src/app/[locale]/(dashboard)/dashboard/subscription/page.tsx
// ============================================================================
//
// [FIX — CHECK N] Sebelumnya file ini punya 'use client' di baris pertama.
// Sekarang server component murni.
//
// [FIX — CHECK E] Sebelumnya file ini mengimpor useAuthStore langsung di
// server component. Zustand store adalah API client-only — mengimpornya di
// sini membuat state bocor lintas request di server dan memaksa seluruh
// halaman jadi client bundle.
//
// Pengecekan EDU sekarang dilakukan di dalam <SubscriptionPageContent />,
// yang memang client component dan memang sudah membaca auth store.
//
// [PHASE F · SPRINT 3] EDU seller melihat EduRestrictedPage DI TEMPAT konten
// subscription — bukan redirect diam-diam.

import type { Metadata } from 'next';
import { SubscriptionPageContent } from '@/components/dashboard/subscription/subscription-page-content';

export const metadata: Metadata = {
  title: 'Langganan',
};

export default function SubscriptionPage() {
  return <SubscriptionPageContent />;
}
