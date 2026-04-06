'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ScrollText, Menu, Sun, Moon, LogOut } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAdminLogout } from '@/hooks/admin/use-admin';
import { useDarkMode } from '@/hooks/shared/use-dark-mode';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/tenants', icon: Users, label: 'Tenants' },
  { href: '/admin/logs', icon: ScrollText, label: 'Audit Logs' },
];

export function AdminMobileNavbar() {
  const pathname = usePathname();
  const { logout } = useAdminLogout();
  const { isDark, toggleDarkMode } = useDarkMode();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-lg border-t" />

      <div className="relative flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-center px-2 py-2 rounded-lg transition-colors min-w-[50px]',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5 transition-transform', active && 'scale-110')} />
              {active && (
                <span className="absolute -bottom-0 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              'flex items-center justify-center px-2 py-2 rounded-lg transition-colors min-w-[50px]',
              'text-muted-foreground hover:text-foreground'
            )}>
              <Menu className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-lg" side="top" align="end" sideOffset={8}>
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
      </div>

      <div className="h-safe-area-inset-bottom bg-background/80" />
    </nav>
  );
}