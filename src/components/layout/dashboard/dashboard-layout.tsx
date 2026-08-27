'use client';

// ============================================================================
// DASHBOARD LAYOUT
// File: src/components/layout/dashboard/dashboard-layout.tsx
//
// [EDU BANNER MOVED — May 2026]
// EduDashboardBanner dihapus dari layout global.
// Badge EDU (Student Mode) sekarang hanya tampil di Settings page —
// lebih kontekstual, tidak mengganggu semua halaman dashboard.
//
// [PHASE F · SPRINT 3 — May 2026]
// OfflineBanner tetap di layout — connectivity issues tetap global.
//
// [MOBILE NAV FIX — May 2026]
// MobileNavbar dan pb-20 padding DISEMBUNYIKAN saat di halaman
// /dashboard/setup-store.
//
// [UI/UX — Aug 2026] pb-20 → pb-40. WizardNav's mobile variant is now
// `fixed` (see shared/wizard-nav.tsx), floating bottom-20 above
// MobileNavbar with its own ~62px height — content needs to clear
// BOTH MobileNavbar (64px) AND that floating pill above it, not just
// the navbar alone. pb-20 was sized for MobileNavbar only, from before
// WizardNav had any fixed-position element to clear on mobile.
//
// ── [INSET UTUH] KENAPA CANGKANGNYA DIKUNCI SETINGGI VIEWPORT ──────────────
//
// Panel `variant="inset"` menggambar dirinya dengan `m-2 rounded-xl
// shadow-sm` — kartu mengambang dengan celah 8px di keempat sisi. Itu benar
// selama isinya muat di layar.
//
// Begitu isinya lebih panjang, cangkangnya (`min-h-svh` di SidebarProvider)
// ikut memanjang, HALAMAN yang menggulir, dan panelnya tumbuh bersama isinya.
// Akibatnya: sudut bawah membulat dan celah 8px-nya mendarat jauh di bawah
// lipatan — di layar, penjual melihat kartu yang tepi bawahnya tidak pernah
// datang. Inset-nya bertahan di atas dan hilang di bawah.
//
// EAS menyelesaikannya dengan mengunci cangkang: tinggi tetap setinggi
// viewport, dan yang menggulir adalah AREA ISI DI DALAM panel. Celah atas,
// bawah, kiri, kanan tidak pernah bergerak sepanjang gulirannya.
//
// Dipasang dari `md` ke atas SAJA, dan itu bukan kompromi: di bawah `md`
// panelnya memang tidak punya margin (`md:peer-data-[variant=inset]:m-2`),
// jadi tidak ada inset yang perlu dipertahankan — dan mengunci tinggi di
// ponsel justru berkelahi dengan bilah URL yang tumbuh-susut serta
// MobileNavbar yang `fixed`.
//
// Angka 1rem = m-2 dua sisi (0.5rem + 0.5rem). Keduanya WAJIB berubah
// bersamaan; kalau margin panelnya digeser, angka ini ikut.
// ============================================================================

import { cn } from '@/lib/shared/utils';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardTopbar } from '@/components/layout/dashboard/dashboard-topbar';
import { DashboardShell } from './dashboard-shell';
import { MobileNavbar } from './mobile-navbar';
import { OfflineBanner } from './offline-banner';
import { LanggananBanner } from './langganan-banner';
import { UpgradeModalHost } from '@/components/dashboard/shared/upgrade-modal-host';
import { usePathname } from '@/i18n/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  /** Dibaca dari cookie `sidebar_state` di layout server. */
  defaultSidebarOpen?: boolean;
}

// [FIX — locale hilang] `stripLocalePrefix` DIHAPUS dari file ini.
//
// Helper itu dulu perlu karena `usePathname` diambil dari 'next/navigation',
// yang mengembalikan path apa adanya termasuk prefix: '/id/dashboard/studio'.
// Sekarang `usePathname` datang dari '@/i18n/navigation' (next-intl), dan itu
// SUDAH mengembalikan path tanpa locale — '/dashboard/studio' baik di /en
// maupun /id. Helper-nya jadi tidak pernah mengubah apa pun.
//
// Dibuang, bukan dibiarkan: fungsi bernama stripLocalePrefix yang tidak
// benar-benar menangani locale adalah tempat pertama orang akan mencari
// ketika ada bug path berikutnya — dan mereka akan mencari di tempat yang salah.

export function DashboardLayout({
  children,
  defaultSidebarOpen = true,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const cleanPath = pathname;

  const isSetupStore = cleanPath.startsWith('/dashboard/setup-store');

  // Studio menggambar pratinjau storefront seukuran panel. Ia butuh lebar
  // penuh TANPA padding — tapi tetap DI DALAM panel, bukan menutupi layar.
  const isStudio = cleanPath.startsWith('/dashboard/studio');

  return (
    /* `data-surface="app"` di SIDEBARPROVIDER, bukan di DashboardShell.
       Provider inilah yang merender pembungkus terluar — elemen yang
       memakai `has-data-[variant=inset]:bg-sidebar` dan karenanya
       membutuhkan `--sidebar` versi dashboard. Shell hidup di dalam
       SidebarInset, sudah terlambat satu tingkat. */
    <SidebarProvider
      defaultOpen={defaultSidebarOpen}
      data-surface="app"
      className="md:h-svh"
    >
      <DashboardSidebar />
      <SidebarInset
        className={cn(
          // Tinggi panel = viewport dikurangi margin `m-2` atas+bawah.
          // `min-h-0` wajib: tanpa itu anak flex memakai `min-height: auto`
          // dan menolak menyusut, sehingga `overflow-y-auto` di dalamnya
          // tidak pernah punya batas untuk digulir.
          'md:h-[calc(100svh-1rem)] md:min-h-0 md:overflow-hidden',
          isSetupStore ? 'pb-0' : 'pb-40 md:pb-0',
        )}
      >
        {/* ── CHROME: TETAP, TIDAK IKUT MENGGULIR ────────────────────────
            Kepala halaman: pemicu sidebar + breadcrumb. Disembunyikan di
            wizard setup-store, yang sengaja tidak punya jalan keluar sampai
            langkahnya selesai. */}
        {!isSetupStore && <DashboardTopbar />}

        {/* z-50 — connectivity issues selalu urgent. Di luar area gulir:
            peringatan koneksi yang bisa digulir pergi adalah peringatan
            yang tidak terbaca justru saat paling dibutuhkan. */}
        <OfflineBanner />

        {/* Di shell, bukan di halaman langganan. Penjual yang sudah membuka
            halaman langganan tidak perlu diingatkan; yang perlu justru yang
            sedang sibuk di Produk atau Kasir. Ia merender null sendiri kalau
            memang tidak ada yang perlu diperingatkan. */}
        <LanggananBanner />

        {/* ── ISI: SATU-SATUNYA YANG MENGGULIR ───────────────────────────
            Gulirannya berhenti di sini, bukan di <body>. Itu yang membuat
            celah 8px panel bertahan sampai baris terakhir. */}
        <div
          className={cn(
            'flex flex-1 flex-col md:min-h-0',
            // Studio menggulir DI DALAM pratinjaunya sendiri; dua wadah
            // bergulir bersarang menghasilkan dua bilah gulir dan roda mouse
            // yang memilih salah satunya secara acak.
            isStudio ? 'md:overflow-hidden' : 'md:overflow-y-auto',
          )}
        >
          <DashboardShell bleed={isStudio}>{children}</DashboardShell>
        </div>

        {/* Satu modal upgrade untuk seluruh dasbor. Tombol mana pun bisa
            memanggil bukaUpgrade() tanpa merender modalnya sendiri. */}
        <UpgradeModalHost />
      </SidebarInset>
      {!isSetupStore && <MobileNavbar />}
    </SidebarProvider>
  );
}