'use client';

// ============================================================================
// KASIR PLAN GATE
// File: src/components/dashboard/kasir/kasir-plan-gate.tsx
//
// Kasir hanya untuk paket STARTER dan BUSINESS. Server menolak tenant FREE
// dengan 403 + code KASIR_PLAN_REQUIRED di SETIAP endpoint kasir.
//
// Gate ini memakai satu probe ringan (GET /kasir/config — endpoint yang
// memang selalu dipanggil halaman kasir) untuk menentukan apakah tenant
// berhak. Kalau tidak, seluruh halaman diganti layar upsell.
//
// Kenapa halaman penuh, bukan modal: user sampai di sini lewat navigasi
// sadar. Halaman inline menjaga URL tetap bermakna, bisa dibaca sesantai
// mungkin, dan tidak menyisakan konten kasir setengah jadi di belakangnya.
// Pola ini sama dengan EduRestrictedPage.
//
// Gate bukan pengaman: server tetap menolak sendiri kalau gate ini dilewati.
// ============================================================================

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Crown, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useKasirConfig } from '@/hooks/dashboard/use-kasir';
import { isKasirPlanRequired } from '@/lib/api/kasir';

export function KasirPlanGate({ children }: { children: React.ReactNode }) {
  const t = useTranslations('dashboard.kasir.planGate');
  const { isLoading, error } = useKasirConfig();

  // Anti-flash: jangan tampilkan apa pun — termasuk layar upsell — sebelum
  // probe selesai. Tanpa gate ini, seller berbayar melihat kedipan
  // "upgrade paket" setiap kali membuka kasir.
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isKasirPlanRequired(error)) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-14 text-center">
        <div className="relative mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <ShoppingCart className="h-8 w-8 text-primary" aria-hidden />
          </div>
          <span className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-amber-950">
            <Crown className="h-4 w-4" aria-hidden />
          </span>
        </div>

        <h1 className="text-xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t('description')}
        </p>

        <ul className="mt-6 w-full space-y-2 rounded-xl border bg-muted/30 p-4 text-left">
          {(['point1', 'point2', 'point3'] as const).map((key) => (
            <li key={key} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="text-muted-foreground">{t(key)}</span>
            </li>
          ))}
        </ul>

        <Button asChild className="mt-6 w-full gap-2">
          <Link href="/dashboard/subscription">
            {t('cta')}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
