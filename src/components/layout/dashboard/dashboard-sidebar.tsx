'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layout,
  Settings,
  BookOpen,
  Store,
  LogOut,
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
import { useLogout } from '@/hooks/auth/use-auth';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const sellerNavigation: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { title: 'Products', href: '/dashboard/products', icon: LayoutDashboard },
      { title: 'Studio', href: '/dashboard/studio', icon: Layout },
      { title: 'Riwayat', href: '/dashboard/products/downloads', icon: History },
      { title: 'Library', href: '/dashboard/library', icon: BookOpen },
    ],
  },
];

const buyerNavigation: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { title: 'Library', href: '/dashboard/library', icon: BookOpen },
    ],
  },
  {
    title: 'Lainnya',
    items: [
      { title: 'Mulai Berjualan', href: '/dashboard/setup-store', icon: Store },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const tenant = useAuthStore((s) => s.tenant);
  const { logout } = useLogout();

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
          <SidebarGroup key={group.title}>
            {navigation.length > 1 && (
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            )}
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {tenant?.role === 'SELLER' && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/dashboard/settings')}>
                <Link href="/dashboard/settings">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout}>
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}