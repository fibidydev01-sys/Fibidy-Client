'use client';

// ============================================================================
// DASHBOARD SIDEBAR (desktop)
// File: src/components/layout/dashboard/dashboard-sidebar.tsx
//
// [SETUP HIGHLIGHT — May 2026]
// Saat user klik nav item yang locked (requiresSetup + !isSetupComplete):
//   1. MandatoryDialog muncul
//   2. User klik "Continue Setup"
//   3. Jika user SUDAH di /dashboard/setup-store:
//      → dispatch CustomEvent 'setup:highlight'
//      → wizard mendengar event → highlight + scroll field kosong step saat ini
//   4. Jika user BELUM di /dashboard/setup-store:
//      → router.push ke setup-store
//      → wizard mount fresh (state awal step 1)
//
// Dengan begini: user yang sudah di step 2 dan coba navigate tetap di step 2,
// field kosong di-highlight, tidak reset ke step 1.
// ============================================================================

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Layout,
  Settings,
  BookOpen,
  Store,
  History,
  CreditCard,
  ShieldCheck,
  ShoppingCart,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/auth-store';
import { useLogout } from '@/hooks/auth/use-auth';
import { FEATURES } from '@/lib/config/features';
import { MandatoryDialog } from '@/components/ui/mandatory-dialog';

interface NavItem {
  titleKey: string;
  href: string;
  icon: LucideIcon;
  hideForEdu?: boolean;
  requiresSetup?: boolean;
}

const sellerNavItems: NavItem[] = [
  { titleKey: 'products', href: '/dashboard/products', icon: LayoutDashboard, requiresSetup: true },
  // [KASIR] Satu entri untuk seluruh modul kasir; Jual/Riwayat/Stok/Laporan
  // dipisah lewat sub-nav di dalamnya (KasirTabs). Ditaruh tepat setelah
  // Produk karena keduanya dipakai berdampingan setiap hari.
  // Tenant FREE tetap melihat entri ini — KasirPlanGate yang menjelaskan
  // kenapa belum bisa dipakai. Menyembunyikannya total membuat fitur
  // berbayar tidak pernah ditemukan orang yang mungkin mau membelinya.
  { titleKey: 'kasir', href: '/dashboard/kasir', icon: ShoppingCart, requiresSetup: true },
  { titleKey: 'studio', href: '/dashboard/studio', icon: Layout, requiresSetup: true },
  ...(FEATURES.digitalProducts
    ? [
      { titleKey: 'downloads', href: '/dashboard/products/downloads', icon: History, requiresSetup: true },
      { titleKey: 'library', href: '/dashboard/library', icon: BookOpen, requiresSetup: true },
    ]
    : []),
  { titleKey: 'subscription', href: '/dashboard/subscription', icon: CreditCard, hideForEdu: true, requiresSetup: true },
  ...(FEATURES.digitalProducts
    ? [{ titleKey: 'onboard', href: '/dashboard/onboard', icon: ShieldCheck, hideForEdu: true, requiresSetup: true }]
    : []),
];

const buyerNavItems: NavItem[] = FEATURES.digitalProducts
  ? [
    { titleKey: 'library', href: '/dashboard/library', icon: BookOpen },
    { titleKey: 'startSelling', href: '/dashboard/setup-store', icon: Store },
  ]
  : [
    { titleKey: 'startSelling', href: '/dashboard/setup-store', icon: Store },
  ];

// ─── Helper ───────────────────────────────────────────────────────────────────

function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (!match) return pathname;
  return match[2] || '/';
}

function isSetupStorePath(pathname: string): boolean {
  return stripLocalePrefix(pathname).startsWith('/dashboard/setup-store');
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardSidebar() {
  const t = useTranslations('dashboard.nav');
  const tGate = useTranslations('dashboard.setupStore.setupGateDialog');
  const pathname = usePathname();
  const router = useRouter();
  const tenant = useAuthStore((s) => s.tenant);
  const { logout } = useLogout();

  const [gateOpen, setGateOpen] = useState(false);

  const isSeller = tenant?.role === 'SELLER';
  const isEdu = isSeller && tenant?.isEduMode === true;
  const isSetupDone = tenant?.isSetupComplete ?? true;

  const rawNavItems = isSeller ? sellerNavItems : buyerNavItems;
  const navItems = rawNavItems.filter((item) => !(isEdu && item.hideForEdu));

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/dashboard/products') {
      return (
        pathname === '/dashboard/products' ||
        pathname.startsWith('/dashboard/products/new') ||
        pathname.match(/^\/dashboard\/products\/[^/]+\/edit$/) !== null
      );
    }
    return pathname.startsWith(href);
  };

  const isLocked = (item: NavItem) => isSeller && !isSetupDone && !!item.requiresSetup;

  // [SETUP HIGHLIGHT] Handler saat user klik "Continue Setup" di dialog
  const handleContinueSetup = () => {
    setGateOpen(false);

    if (isSetupStorePath(pathname)) {
      // User sudah di setup-store — jangan navigate, cukup highlight field kosong
      // Dispatch event → seller-setup-wizard.tsx mendengar dan trigger highlight
      window.dispatchEvent(new CustomEvent('setup:highlight'));
    } else {
      // User belum di setup-store — navigate ke sana
      router.push('/dashboard/setup-store');
    }
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarContent className="flex flex-col justify-center">
          <SidebarGroup>
            <SidebarMenu>
              {navItems.map((item) => {
                const locked = isLocked(item);
                return (
                  <SidebarMenuItem key={item.href}>
                    {locked ? (
                      <SidebarMenuButton
                        onClick={() => setGateOpen(true)}
                        className="opacity-50 cursor-pointer"
                        isActive={false}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{t(item.titleKey)}</span>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton asChild isActive={isActive(item.href)}>
                        <Link href={item.href}>
                          <item.icon className="h-5 w-5" />
                          <span>{t(item.titleKey)}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            {isSeller ? (
              <SidebarMenuItem>
                {!isSetupDone ? (
                  <SidebarMenuButton
                    onClick={() => setGateOpen(true)}
                    className="opacity-50 cursor-pointer"
                    isActive={false}
                  >
                    <Settings className="h-5 w-5" />
                    <span>{t('settings')}</span>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton asChild isActive={isActive('/dashboard/settings')}>
                    <Link href="/dashboard/settings">
                      <Settings className="h-5 w-5" />
                      <span>{t('settings')}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => logout()}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{t('signOut')}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

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