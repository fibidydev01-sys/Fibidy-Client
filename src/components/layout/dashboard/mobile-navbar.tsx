'use client';

// ==========================================
// MOBILE NAVBAR
// File: src/components/layout/dashboard/mobile-navbar.tsx
//
// Role-based navigation (no group labels).
//
// [PHASE 3] Digital nav items are now conditional on
// FEATURES.digitalProducts.
//
// SELLER (digital ON):  Products, Studio, Library, Downloads, Settings
// SELLER (digital OFF): Products, Studio, Settings
// BUYER  (digital ON):  Library, Start Selling, Sign Out
// BUYER  (digital OFF): Start Selling, Sign Out
// ==========================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Layout,
  Settings,
  History,
  BookOpen,
  Store,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useLogout } from '@/hooks/auth/use-auth';
import { FEATURES } from '@/lib/config/features';
import type { LucideIcon } from 'lucide-react';

interface NavItemDef {
  href?: string;
  icon: LucideIcon;
  labelKey: string;
  /** When true, this item triggers a logout action instead of navigation */
  isSignOut?: boolean;
}

// ── SELLER mobile nav ──
const sellerNavItems: NavItemDef[] = [
  { href: '/dashboard/products', icon: LayoutDashboard, labelKey: 'products' },
  { href: '/dashboard/studio', icon: Layout, labelKey: 'studio' },
  ...(FEATURES.digitalProducts
    ? [
        { href: '/dashboard/library', icon: BookOpen, labelKey: 'library' },
        {
          href: '/dashboard/products/downloads',
          icon: History,
          labelKey: 'downloads',
        },
      ]
    : []),
  { href: '/dashboard/settings', icon: Settings, labelKey: 'settings' },
];

// ── BUYER mobile nav ──
const buyerNavItems: NavItemDef[] = FEATURES.digitalProducts
  ? [
      { href: '/dashboard/library', icon: BookOpen, labelKey: 'library' },
      { href: '/dashboard/setup-store', icon: Store, labelKey: 'sell' },
      { icon: LogOut, labelKey: 'signOut', isSignOut: true },
    ]
  : [
      // Digital off — BUYER lands on setup-store; no Library link.
      { href: '/dashboard/setup-store', icon: Store, labelKey: 'sell' },
      { icon: LogOut, labelKey: 'signOut', isSignOut: true },
    ];

export function MobileNavbar() {
  const t = useTranslations('dashboard.nav');
  const pathname = usePathname();
  const tenant = useAuthStore((s) => s.tenant);
  const { logout } = useLogout();

  const navItems = tenant?.role === 'SELLER' ? sellerNavItems : buyerNavItems;

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-lg border-t" />

      <div className="relative flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          // Sign out button — action, not navigation
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

          // Nav link
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
  );
}
