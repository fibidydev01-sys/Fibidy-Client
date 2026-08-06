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
// ============================================================================

import { usePathname } from 'next/navigation';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardShell } from './dashboard-shell';
import { MobileNavbar } from './mobile-navbar';
import { OfflineBanner } from './offline-banner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (!match) return pathname;
  return match[2] || '/';
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const cleanPath = stripLocalePrefix(pathname);

  const isSetupStore = cleanPath.startsWith('/dashboard/setup-store');

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className={isSetupStore ? 'pb-0' : 'pb-40 md:pb-0'}>
        {/* z-50 — connectivity issues selalu urgent */}
        <OfflineBanner />
        <DashboardShell>{children}</DashboardShell>
      </SidebarInset>
      {!isSetupStore && <MobileNavbar />}
    </SidebarProvider>
  );
}