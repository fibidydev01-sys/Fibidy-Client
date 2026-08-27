'use client';

// ============================================================================
// KASIR PLAN GATE — spanduk, bukan tembok
// File: src/components/dashboard/kasir/kasir-plan-gate.tsx
//
// ── APA YANG BERUBAH, DAN KENAPA ───────────────────────────────────────────
//
// Versi sebelumnya MENGGANTI seluruh halaman kasir dengan satu kartu upsell.
// Untuk tenant yang belum pernah bayar, akibatnya cuma layar kosong. Untuk
// tenant yang PERNAH bayar lalu turun ke FREE, akibatnya jauh lebih berat:
// riwayat transaksi, preset diskon, program promo, dan konfigurasi struknya
// lenyap dari layar.
//
// Datanya tidak pernah hilang — tidak ada `deleteMany`, tidak ada cron yang
// menyentuh tabel kasir. Jadi yang terjadi bukan kehilangan data, melainkan
// penjual yang tidak boleh melihat catatannya sendiri: catatan yang mungkin
// ia butuhkan untuk pembukuan, pajak, atau sengketa dengan pembeli. Dan ia
// tidak punya jalan keluar selain membayar lagi — beda dengan batas foto
// atau blok landing, yang setidaknya bisa diakali sendiri.
//
// Aturannya sekarang: BERHENTI BAYAR MENCABUT ALAT, BUKAN CATATAN.
//
// ── KENAPA SUMBERNYA BUKAN LAGI PROBE 403 ──────────────────────────────────
// Dulu gate ini menebak hak akses dari kegagalan `GET /kasir/config` (403
// KASIR_PLAN_REQUIRED). Sesudah `KasirPlanGuard` jadi sadar-method, GET
// TIDAK LAGI DITOLAK — jadi probe itu selamanya berhasil dan tidak lagi bisa
// membedakan apa pun. Sumbernya sekarang tier langsung.
//
// ── INI TAMPILAN, BUKAN PENGAMAN ───────────────────────────────────────────
// Yang menahan mutasi ada di dua tempat lain, dan keduanya tetap bekerja
// walau berkas ini dihapus: `useKasirMutation` di klien (permintaannya tidak
// pernah berangkat) dan `KasirPlanGuard` di server (403 untuk semua mutasi).
// Spanduk ini cuma menjelaskan kenapa.
// ============================================================================

import { useTranslations } from 'next-intl';
import { ArrowRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubscriptionPlan } from '@/hooks/dashboard/use-subscription-plan';
import { Link } from '@/i18n/navigation';

/** Spanduk penjelas. Diekspor supaya halaman bisa menaruhnya sendiri. */
export function KasirTerkunciBanner() {
  const t = useTranslations('dashboard.kasir.planGate');

  return (
    <div className="flex flex-col gap-3 rounded-[var(--shape-panel)] border border-amber-300/60 bg-amber-50/60 p-4 dark:border-amber-500/30 dark:bg-amber-950/20 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/20">
          <Crown className="size-4 text-amber-600 dark:text-amber-400" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{t('title')}</p>
          <p className="text-xs text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      <Button asChild size="sm" className="shrink-0 gap-2">
        <Link href="/dashboard/subscription">
          {t('cta')}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}

export function KasirPlanGate({
  children,
  fallback,
}: {
  children: React.ReactNode;
  /**
   * Bentuk skeleton selama paket dibaca. Default-nya menyerupai halaman kasir
   * penuh — benar untuk /dashboard/kasir/*, tapi salah saat gate ini dipasang
   * di dalam satu seksi Pengaturan, yang kotaknya jauh lebih kecil. Pemanggil
   * di sana mengoper skeleton seukuran seksinya sendiri supaya tidak ada
   * lompatan tata letak.
   */
  fallback?: React.ReactNode;
}) {
  const { tier, isLoading } = useSubscriptionPlan();

  // Anti-kedip. `useSubscriptionPlan` punya placeholderData bertier FREE,
  // jadi tanpa penahan ini penjual BERBAYAR melihat spanduk "perlu paket"
  // sekejap setiap kali membuka kasir.
  if (isLoading) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-full max-w-md rounded-[var(--shape-control)]" />
          <Separator />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full rounded-[var(--shape-panel)]" />
      </div>
    );
  }

  if (tier !== 'FREE') return <>{children}</>;

  // Isinya TETAP dirender. Itu inti perubahan ini.
  //
  // ── KENAPA `h-full min-h-0` DAN `flex-1 min-h-0` ──────────────────────
  //
  // Anak-anaknya (seksi Pengaturan) memakai `h-full flex flex-col` dengan
  // WizardNav sebagai anak terakhir supaya bilah navigasinya mepet ke dasar
  // layar. `h-full` butuh induk yang tingginya PASTI. Versi pertama
  // pembungkus ini cuma `flex w-full flex-col`, jadi tingginya ditentukan
  // isinya sendiri — dan `h-full` anaknya menyelesaikan diri terhadap
  // tinggi yang belum ada. Akibatnya bilah "Kembali" berhenti tepat di
  // bawah kartu terakhir, bukan di dasar layar.
  //
  // `min-h-0` wajib menyertai `flex-1`: tanpa itu, anak flex tidak boleh
  // menyusut di bawah tinggi kontennya dan `h-full` di dalamnya tetap
  // meleset saat isinya panjang.
  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4">
      <KasirTerkunciBanner />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
