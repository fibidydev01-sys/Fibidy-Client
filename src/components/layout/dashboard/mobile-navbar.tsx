'use client';

// ==========================================
// MOBILE NAVBAR
//
// EDIT: Role-based navigation
//
// SELLER: Products, Studio, Digital, Library, Settings
// BUYER:  Library, Start Selling
// ==========================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Layout, Settings, History, BookOpen, Store } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { LucideIcon } from 'lucide-react';

interface NavItemDef {
  href: string;
  icon: LucideIcon;
  labelKey: string;
}

const sellerNavItems: NavItemDef[] = [
  { href: '/dashboard/products', icon: LayoutDashboard, labelKey: 'products' },
  { href: '/dashboard/studio', icon: Layout, labelKey: 'studio' },
  { href: '/dashboard/library', icon: BookOpen, labelKey: 'library' },
  { href: '/dashboard/products/downloads', icon: History, labelKey: 'downloads' },
  { href: '/dashboard/settings', icon: Settings, labelKey: 'settings' },
];

const buyerNavItems: NavItemDef[] = [
  { href: '/dashboard/library', icon: BookOpen, labelKey: 'library' },
  { href: '/dashboard/setup-store', icon: Store, labelKey: 'sell' },
];

export function MobileNavbar() {
  const t = useTranslations('dashboard.nav');
  const pathname = usePathname();
  const tenant = useAuthStore((s) => s.tenant);

  const navItems = tenant?.role === 'SELLER' ? sellerNavItems : buyerNavItems;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
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
                'flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-[50px]',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <item.icon className={cn('h-5 w-5 transition-transform', active && 'scale-110')} />
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