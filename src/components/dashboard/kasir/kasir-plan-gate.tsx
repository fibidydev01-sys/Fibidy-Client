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
//
// [UI/UX — Agu 2026] Skeleton-nya sekarang berbentuk KasirPageShell: judul,
// strip tab setinggi h-9, garis pemisah, lalu konten. Sebelumnya bentuknya
// (h-9 w-48 → h-12 → h-64) tidak menyerupai halaman mana pun, jadi setiap
// masuk ke modul kasir ada dua lompatan tata letak: skeleton → halaman.
// ============================================================================

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Crown, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-full max-w-md rounded-lg" />
          <Separator />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isKasirPlanRequired(error)) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="relative mx-auto mb-2">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <ShoppingCart className="size-8 text-primary" aria-hidden />
            </div>
            <Badge className="absolute -right-2 -top-2 gap-1 bg-amber-400 text-amber-950 hover:bg-amber-400">
              <Crown className="size-3" aria-hidden />
            </Badge>
          </div>

          <CardTitle className="text-xl font-bold tracking-tight">
            {t('title')}
          </CardTitle>
          <CardDescription className="leading-relaxed">
            {t('description')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ul className="space-y-2 rounded-lg bg-muted/50 p-4 text-left">
            {(['point1', 'point2', 'point3'] as const).map((key) => (
              <li key={key} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="text-muted-foreground">{t(key)}</span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter>
          <Button asChild className="w-full gap-2">
            <Link href="/dashboard/subscription">
              {t('cta')}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return <>{children}</>;
}
