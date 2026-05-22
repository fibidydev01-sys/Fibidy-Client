'use client';

// ============================================================================
// DASHBOARD SIDEBAR (desktop)
// File: src/components/layout/dashboard/dashboard-sidebar.tsx
//
// [PHASE D — May 2026]
// - Render EduBadge di bawah nama toko jika tenant.isEduMode === true
// - Filter nav items: EDU seller tidak lihat Subscription + Onboard menu
//
// [PHASE 3] Digital-related nav items conditional on FEATURES.digitalProducts
// ============================================================================

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
import { EduBadge } from './edu-badge';

interface NavItem {
  titleKey: string;
  href: string;
  icon: LucideIcon;
}

// ── SELLER nav items ──
const sellerNavItems: NavItem[] = [
  { titleKey: 'products', href: '/dashboard/products', icon: LayoutDashboard },
  { titleKey: 'studio', href: '/dashboard/studio', icon: Layout },
  ...(FEATURES.digitalProducts
    ? [
        { titleKey: 'downloads', href: '/dashboard/products/downloads', icon: History },
        { titleKey: 'library', href: '/dashboard/library', icon: BookOpen },
      ]
    : []),
];

// ── SELLER nav items for EDU mode (filter out subscription/onboard) ──
// Subscription is in Settings → filtered at settings level
// Main nav items stay the same for EDU

// ── BUYER nav items ──
const buyerNavItems: NavItem[] = FEATURES.digitalProducts
  ? [
      { titleKey: 'library', href: '/dashboard/library', icon: BookOpen },
      { titleKey: 'startSelling', href: '/dashboard/setup-store', icon: Store },
    ]
  : [
      { titleKey: 'startSelling', href: '/dashboard/setup-store', icon: Store },
    ];

export function DashboardSidebar() {
  const t = useTranslations('dashboard.nav');
  const pathname = usePathname();
  const tenant = useAuthStore((s) => s.tenant);
  const { logout } = useLogout();

  const isSeller = tenant?.role === 'SELLER';
  const isEdu = isSeller && tenant?.isEduMode === true;
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
          {/* Store name + EDU badge */}
          {tenant?.name && (
            <div className="px-2 py-2 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground truncate">
                {tenant.name}
              </p>
              {/* [PHASE D] EDU badge — hanya tampil jika isEduMode */}
              {isEdu && <EduBadge />}
            </div>
          )}

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
