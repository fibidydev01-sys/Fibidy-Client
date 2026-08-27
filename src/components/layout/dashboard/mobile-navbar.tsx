'use client';

// ============================================================================
// MOBILE NAVBAR
// File: src/components/layout/dashboard/mobile-navbar.tsx
//
// [SETUP HIGHLIGHT — May 2026]
// Pattern identik dashboard-sidebar.tsx:
//   - User sudah di setup-store → dispatch 'setup:highlight' (tetap di step saat ini)
//   - User belum di setup-store → router.push ke setup-store
// ============================================================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Layout,
  Settings,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { useAuthStore } from '@/stores/auth-store';
import { MandatoryDialog } from '@/components/ui/mandatory-dialog';
import { Link, usePathname, useRouter } from '@/i18n/navigation';

interface NavItemDef {
  href?: string;
  icon: LucideIcon;
  labelKey: string;
  /** Fitur berbayar. Entrinya tetap terbuka — gerbangnya di tombol, bukan di sini. */
  requiresPaidPlan?: boolean;
  hideForEdu?: boolean;
  requiresSetup?: boolean;
}

const sellerNavItems: NavItemDef[] = [
  { href: '/dashboard/products', icon: LayoutDashboard, labelKey: 'products', requiresSetup: true },
  // [KASIR] Aksi paling sering dipakai seller yang berjualan offline, jadi
  // ikut masuk tab bar mobile — bukan disembunyikan di menu lain.
  // [MAHKOTA] Lihat dashboard-sidebar.tsx untuk alasan lengkapnya — pendeknya:
  // kasir 403 di kesembilan controller-nya, jadi read-only bermahkota akan
  // tampil kosong dan terbaca rusak. Mahkota di entri nav memindahkan sinyal
  // "ini berbayar" ke sebelum klik, dan KasirPlanGate tetap yang menjelaskan.
  { href: '/dashboard/kasir', icon: ShoppingCart, labelKey: 'kasir', requiresSetup: true, requiresPaidPlan: true },
  { href: '/dashboard/studio', icon: Layout, labelKey: 'studio', requiresSetup: true },
  { href: '/dashboard/settings', icon: Settings, labelKey: 'settings', requiresSetup: true },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

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

function isSetupStorePath(pathname: string): boolean {
  return pathname.startsWith('/dashboard/setup-store');
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Ikon nav dengan badge mahkota opsional di pojok kanan atas.
 *
 * Di navbar mobile tidak ada ruang di sebelah label — labelnya sendiri cuma
 * 10px. Jadi mahkotanya menempel di pojok ikon, pola yang sama dipakai kartu
 * KasirPlanGate.
 */
// [MAHKOTA DICABUT DARI NAV] Alasan lengkapnya di dashboard-sidebar.tsx.
// Ringkasnya: mahkota di entri navigasi menandai SELURUH halaman, padahal
// isi halaman Kasir justru terbuka — yang tertutup cuma tombol menulisnya.
// Penjual yang melihatnya menyimpulkan Kasir terkunci lalu tidak pernah
// membukanya, padahal catatan penjualannya ada di dalam sana.
function IkonNav({
  item,
  className,
}: {
  item: NavItemDef;
  className?: string;
}) {
  return <item.icon className={cn('h-5 w-5', className)} />;
}

export function MobileNavbar() {
  const t = useTranslations('dashboard.nav');
  const tGate = useTranslations('dashboard.setupStore.setupGateDialog');
  const pathname = usePathname();
  const router = useRouter();
  const tenant = useAuthStore((s) => s.tenant);

  const [gateOpen, setGateOpen] = useState(false);

  const isEdu = tenant?.isEduMode === true;
  const isSetupDone = tenant?.isSetupComplete ?? true;

  const navItems = sellerNavItems.filter(
    (item) => !(isEdu && item.hideForEdu),
  );

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const isLocked = (item: NavItemDef) =>
    !isSetupDone && !!item.requiresSetup;

  // [SETUP HIGHLIGHT] Identik dashboard-sidebar handleContinueSetup
  const handleContinueSetup = () => {
    setGateOpen(false);

    if (isSetupStorePath(pathname)) {
      // Sudah di setup-store — highlight field kosong step saat ini
      window.dispatchEvent(new CustomEvent('setup:highlight'));
    } else {
      // Belum di setup-store — navigate
      router.push('/dashboard/setup-store');
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-lg border-t" />

        <div className="relative flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
          {navItems.map((item) => {

            // Locked — setup not complete
            if (isLocked(item)) {
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => setGateOpen(true)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-[50px]',
                    'text-muted-foreground/40',
                  )}
                >
                  <IkonNav item={item} />
                  <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
                </button>
              );
            }

            // Normal
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-[50px]',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <IkonNav
                  item={item}
                  className={cn('transition-transform', active && 'scale-110')}
                />
                <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
                {active && (
                  <span className="absolute -bottom-0 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="h-safe-area-inset-bottom bg-background/80" />
      </nav>

      <MandatoryDialog
        open={gateOpen}
        title={tGate('title')}
        description={tGate('description')}
        primaryCta={{
          label: tGate('cta'),
          onClick: handleContinueSetup,
          showArrow: true,
        }}
      />
    </>
  );
}