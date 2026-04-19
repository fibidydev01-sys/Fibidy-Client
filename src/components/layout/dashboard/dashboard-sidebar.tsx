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
  type LucideIcon,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/auth-store';

interface NavItem {
  titleKey: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  titleKey: string;
  items: NavItem[];
}

const sellerNavigation: NavGroup[] = [
  {
    titleKey: 'main',
    items: [
      { titleKey: 'products', href: '/dashboard/products', icon: LayoutDashboard },
      { titleKey: 'studio', href: '/dashboard/studio', icon: Layout },
      { titleKey: 'downloads', href: '/dashboard/products/downloads', icon: History },
      { titleKey: 'library', href: '/dashboard/library', icon: BookOpen },
    ],
  },
];

const buyerNavigation: NavGroup[] = [
  {
    titleKey: 'main',
    items: [
      { titleKey: 'library', href: '/dashboard/library', icon: BookOpen },
    ],
  },
  {
    titleKey: 'more',
    items: [
      { titleKey: 'startSelling', href: '/dashboard/setup-store', icon: Store },
    ],
  },
];

export function DashboardSidebar() {
  const t = useTranslations('dashboard.nav');
  const pathname = usePathname();
  const tenant = useAuthStore((s) => s.tenant);

  const navigation = tenant?.role === 'SELLER' ? sellerNavigation : buyerNavigation;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/dashboard/products') {
      return pathname === '/dashboard/products' ||
        pathname.startsWith('/dashboard/products/new') ||
        pathname.match(/^\/dashboard\/products\/[^/]+\/edit$/) !== null;
    }
    return pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col justify-center">
        {navigation.map((group) => (
          <SidebarGroup key={group.titleKey}>
            {navigation.length > 1 && (
              <SidebarGroupLabel>{t(group.titleKey)}</SidebarGroupLabel>
            )}
            <SidebarMenu>
              {group.items.map((item) => (
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
        ))}
      </SidebarContent>

      {tenant?.role === 'SELLER' && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/dashboard/settings')}>
                <Link href="/dashboard/settings">
                  <Settings className="h-5 w-5" />
                  <span>{t('settings')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}