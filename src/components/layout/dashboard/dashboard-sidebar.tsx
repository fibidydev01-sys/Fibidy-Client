'use client';

// ==========================================
// DASHBOARD SIDEBAR (desktop)
// File: src/components/layout/dashboard/dashboard-sidebar.tsx
//
// [PHASE 3] Digital-related nav items are now conditional on
// FEATURES.digitalProducts:
//   - Downloads (seller-only) — hidden when off
//   - Library (both roles)    — hidden when off
//   - BUYER role with digital off has only "Start Selling" — Library
//     link is hidden (it would 503 anyway).
// ==========================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Layout,
  Settings,
  BookOpen,
  Store,
  History,
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

interface NavItem {
  titleKey: string;
  href: string;
  icon: LucideIcon;
}

// ── SELLER nav: Products + Studio always; digital items conditional ──
const sellerNavItems: NavItem[] = [
  { titleKey: 'products', href: '/dashboard/products', icon: LayoutDashboard },
  { titleKey: 'studio', href: '/dashboard/studio', icon: Layout },
  ...(FEATURES.digitalProducts
    ? [
        {
          titleKey: 'downloads',
          href: '/dashboard/products/downloads',
          icon: History,
        },
        { titleKey: 'library', href: '/dashboard/library', icon: BookOpen },
      ]
    : []),
];

// ── BUYER nav: Library only when digital ON; setup-store always ──
const buyerNavItems: NavItem[] = FEATURES.digitalProducts
  ? [
      { titleKey: 'library', href: '/dashboard/library', icon: BookOpen },
      { titleKey: 'startSelling', href: '/dashboard/setup-store', icon: Store },
    ]
  : [
      // Digital off — BUYER's only meaningful destination is setup-store.
      // RouteGuard will redirect BUYER from any other path here.
      { titleKey: 'startSelling', href: '/dashboard/setup-store', icon: Store },
    ];

export function DashboardSidebar() {
  const t = useTranslations('dashboard.nav');
  const pathname = usePathname();
  const tenant = useAuthStore((s) => s.tenant);
  const { logout } = useLogout();

  const isSeller = tenant?.role === 'SELLER';
  const navItems = isSeller ? sellerNavItems : buyerNavItems;

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

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col justify-center">
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive(item.href)}>
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{t(item.titleKey)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {isSeller ? (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/dashboard/settings')}
              >
                <Link href="/dashboard/settings">
                  <Settings className="h-5 w-5" />
                  <span>{t('settings')}</span>
                </Link>
              </SidebarMenuButton>
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
  );
}
