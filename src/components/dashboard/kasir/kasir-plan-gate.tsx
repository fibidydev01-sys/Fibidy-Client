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
//
// ── [REVISI — Aug 2026] BANNER DILEPAS DARI GATE, BUKAN DARI FILE ─────────
//
// `KasirTerkunciBanner` dulu otomatis dirender oleh `KasirPlanGate` di atas
// `children` setiap kali tier-nya FREE. Efek sampingnya: begitu WizardHeader
// dipindah jadi header sticky-top full-bleed (lihat wizard-header.tsx), banner
// ini — bukan WizardHeader — yang jadi elemen PERTAMA di area scroll, sehingga
// WizardHeader nempel ke BAWAH banner alih-alih ke DashboardTopbar. Bar
// navigasi jadi terlihat "terpotong" di antara dua elemen berwarna berbeda,
// alih-alih menyatu sebagai satu header yang bersih.
//
// Keputusan produk: banner ini dianggap tidak cukup penting untuk mengalahkan
// konsistensi posisi WizardHeader. `KasirPlanGate` sekarang TIDAK LAGI
// merender `KasirTerkunciBanner` sendiri — begitu tier-nya FREE, gate ini
// langsung merender `children` apa adanya, sama seperti tier berbayar.
//
// `KasirTerkunciBanner` TETAP diekspor (tidak dihapus dari file) persis
// seperti komentar aslinya: "Diekspor supaya halaman bisa menaruhnya
// sendiri." Kalau suatu saat ada kebutuhan menampilkannya lagi di tempat
// lain — mis. di dalam salah satu section, DI BAWAH WizardHeader-nya sendiri,
// bukan di atas — komponennya sudah siap dipakai langsung tanpa perlu
// ditulis ulang.
//
// Yang TIDAK berubah oleh revisi ini: `useKasirMutation` dan
// `KasirPlanGuard` (server) sama sekali tidak disentuh. Tenant FREE tetap
// tidak bisa melakukan mutasi apa pun di kasir — cuma penjelasan visualnya
// yang dilepas dari gate, bukan pengamannya.
// ============================================================================

import { useTranslations } from 'next-intl';
import { ArrowRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubscriptionPlan } from '@/hooks/dashboard/use-subscription-plan';
import { Link } from '@/i18n/navigation';

/**
 * Spanduk penjelas. Diekspor supaya halaman bisa menaruhnya sendiri.
 *
 * [REVISI — Aug 2026] `KasirPlanGate` di bawah TIDAK LAGI memanggil ini
 * secara otomatis (lihat catatan header berkas). Komponen ini dipertahankan
 * apa adanya untuk pemanggil yang mungkin ingin menaruhnya secara eksplisit
 * di tempat lain.
 */
export function KasirTerkunciBanner() {
  const t = useTranslations('dashboard.kasir.planGate');

  return (
    <div className="flex flex-col gap-3 rounded-[var(--shape-panel)] border border-amber-300/60 bg-amber-50/60 p-4 dark:border-amber-500/30 dark:bg-amber-950/20 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[var(--shape-panel)] bg-amber-400/20">
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

  // [REVISI — Aug 2026] Dulu di sini ada cabang `if (tier !== 'FREE') return
  // <>{children}</>` diikuti render banner + children untuk tier FREE.
  // Sekarang KEDUA kasus (FREE maupun berbayar) langsung merender `children`
  // apa adanya — gate ini tidak lagi menyisipkan elemen visual apa pun di
  // atasnya. Lihat catatan header berkas untuk alasan lengkapnya.
  //
  // Mutasi tenant FREE tetap ditolak di `useKasirMutation` (klien) dan
  // `KasirPlanGuard` (server) — itu TIDAK berubah oleh baris ini.
  return <>{children}</>;
}