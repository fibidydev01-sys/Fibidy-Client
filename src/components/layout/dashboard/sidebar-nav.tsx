'use client';

// ==========================================
// DASHBOARD SIDEBAR NAV — v3 Unified
//
// REMOVED: Digital Products menu (merged into Products)
// KEPT: Products (unified), Library, Settings, Discover
//
// Layout ini di-import oleh dashboard layout.
// Sesuaikan path import di layout lo kalau beda.
// ==========================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Package,
  BookOpen,
  Settings,
  Compass,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/shared/utils';

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
  match?: string; // pathname startsWith match
}

const SELLER_NAV: NavItem[] = [
  {
    labelKey: 'products',
    href: '/dashboard/products',
    icon: Package,
    match: '/dashboard/products',
  },
];

const BUYER_NAV: NavItem[] = [
  {
    labelKey: 'library',
    href: '/dashboard/library',
    icon: BookOpen,
    match: '/dashboard/library',
  },
];

const COMMON_NAV: NavItem[] = [
  {
    labelKey: 'discover',
    href: '/discover',
    icon: Compass,
  },
  {
    labelKey: 'settings',
    href: '/dashboard/settings',
    icon: Settings,
    match: '/dashboard/settings',
  },
];

interface DashboardSidebarNavProps {
  role?: 'BUYER' | 'SELLER';
  onLogout?: () => void;
}

export function DashboardSidebarNav({ role = 'SELLER', onLogout }: DashboardSidebarNavProps) {
  const t = useTranslations('dashboard.nav');
  const pathname = usePathname();

  const navItems = [
    ...(role === 'SELLER' ? SELLER_NAV : []),
    ...BUYER_NAV,
    ...COMMON_NAV,
  ];

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        const isActive = item.match
          ? pathname.startsWith(item.match)
          : pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {t(item.labelKey)}
          </Link>
        );
      })}

      {/* Logout */}
      {onLogout && (
        <>
          <div className="my-2 border-t" />
          <button
            onClick={onLogout}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {t('logout')}
          </button>
        </>
      )}
    </nav>
  );
}