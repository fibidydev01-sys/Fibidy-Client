'use client';

// [TIDUR-NYENYAK FIX #6] Added "Maintenance" menu item.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Users,
  ScrollText,
  Wrench,
  Menu,
  Moon,
  Sun,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminLogout } from '@/hooks/admin/use-admin';
import { useDarkMode } from '@/hooks/shared/use-dark-mode';

interface NavItem {
  titleKey: string;
  href: string;
  icon: LucideIcon;
}

const navigation: NavItem[] = [
  { titleKey: 'dashboard', href: '/admin', icon: LayoutDashboard },
  { titleKey: 'tenants', href: '/admin/tenants', icon: Users },
  { titleKey: 'logs', href: '/admin/logs', icon: ScrollText },
  // [FIX #6] New route
  { titleKey: 'maintenance', href: '/admin/maintenance', icon: Wrench },
];

export function AdminSidebar() {
  const t = useTranslations('admin.nav');
  const pathname = usePathname();
  const { logout } = useAdminLogout();
  const { isDark, toggleDarkMode } = useDarkMode();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col justify-center">
        <SidebarGroup>
          <SidebarMenu>
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={active}>
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Menu className="h-5 w-5" />
                  <span>{t('menu')}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={toggleDarkMode}>
                  {isDark ? (
                    <>
                      <Sun className="mr-3 h-5 w-5" />
                      {t('lightMode')}
                    </>
                  ) : (
                    <>
                      <Moon className="mr-3 h-5 w-5" />
                      {t('darkMode')}
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-3 h-5 w-5" />
                  {t('signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}