'use client';

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

interface NavItem {
  titleKey: string;
  href: string;
  icon: LucideIcon;
}

const sellerNavItems: NavItem[] = [
  { titleKey: 'products', href: '/dashboard/products', icon: LayoutDashboard },
  { titleKey: 'studio', href: '/dashboard/studio', icon: Layout },
  { titleKey: 'downloads', href: '/dashboard/products/downloads', icon: History },
  { titleKey: 'library', href: '/dashboard/library', icon: BookOpen },
];

const buyerNavItems: NavItem[] = [
  { titleKey: 'library', href: '/dashboard/library', icon: BookOpen },
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