'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ScrollText, Menu, Moon, Sun, LogOut, type LucideIcon } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAdminLogout } from '@/hooks/admin/use-admin';
import { useDarkMode } from '@/hooks/shared/use-dark-mode';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const navigation: NavItem[] = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Tenants', href: '/admin/tenants', icon: Users },
  { title: 'Audit Logs', href: '/admin/logs', icon: ScrollText },
];

export function AdminSidebar() {
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
                      <span>{item.title}</span>
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
                  <span>Menu</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-lg" side="top" align="start" sideOffset={4}>
                <DropdownMenuItem onClick={toggleDarkMode}>
                  {isDark ? (
                    <><Sun className="mr-3 h-5 w-5" />Light mode</>
                  ) : (
                    <><Moon className="mr-3 h-5 w-5" />Dark mode</>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}