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
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Layout,
  Settings,
  History,
  BookOpen,
  Store,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useLogout } from '@/hooks/auth/use-auth';
import { FEATURES } from '@/lib/config/features';
import { MandatoryDialog } from '@/components/ui/mandatory-dialog';

interface NavItemDef {
  href?: string;
  icon: LucideIcon;
  labelKey: string;
  isSignOut?: boolean;
  hideForEdu?: boolean;
  requiresSetup?: boolean;
}

const sellerNavItems: NavItemDef[] = [
  { href: '/dashboard/products', icon: LayoutDashboard, labelKey: 'products', requiresSetup: true },
  { href: '/dashboard/studio', icon: Layout, labelKey: 'studio', requiresSetup: true },
  ...(FEATURES.digitalProducts
    ? [
      { href: '/dashboard/library', icon: BookOpen, labelKey: 'library', requiresSetup: true },
      { href: '/dashboard/products/downloads', icon: History, labelKey: 'downloads', requiresSetup: true },
    ]
    : []),
  { href: '/dashboard/settings', icon: Settings, labelKey: 'settings', requiresSetup: true },
];

const buyerNavItems: NavItemDef[] = FEATURES.digitalProducts
  ? [
    { href: '/dashboard/library', icon: BookOpen, labelKey: 'library' },
    { href: '/dashboard/setup-store', icon: Store, labelKey: 'sell' },
    { icon: LogOut, labelKey: 'signOut', isSignOut: true },
  ]
  : [
    { href: '/dashboard/setup-store', icon: Store, labelKey: 'sell' },
    { icon: LogOut, labelKey: 'signOut', isSignOut: true },
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

export function MobileNavbar() {
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

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const isLocked = (item: NavItemDef) =>
    isSeller && !isSetupDone && !!item.requiresSetup;

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

            // Sign out
            if (item.isSignOut) {
              return (
                <button
                  key="sign-out"
                  type="button"
                  onClick={() => logout()}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-[50px]',
                    'text-destructive hover:text-destructive/80',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
                </button>
              );
            }

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
                  <item.icon className="h-5 w-5" />
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
                <item.icon
                  className={cn('h-5 w-5 transition-transform', active && 'scale-110')}
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