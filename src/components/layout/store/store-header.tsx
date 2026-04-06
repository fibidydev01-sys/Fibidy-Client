'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, Rocket, LayoutDashboard, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader } from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useStoreUrls } from '@/lib/public/use-store-urls';
import { cn } from '@/lib/shared/utils';
import type { PublicTenant } from '@/types/tenant';

interface StoreHeaderProps {
  tenant: PublicTenant;
}

export function StoreHeader({ tenant }: StoreHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const urls = useStoreUrls(tenant.slug);

  const navItems = [
    { label: 'Home', href: urls.home },
    { label: 'Featured', href: urls.path('/about') },
    { label: 'Products', href: urls.products() },
    { label: 'Contact', href: urls.path('/contact') },
  ];

  const contactInfo = [
    { label: 'WhatsApp', value: tenant.whatsapp, type: 'whatsapp' as const },
    { label: 'Address', value: tenant.address, type: 'address' as const },
  ].filter(item => item.value);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">

        {/* ── LEFT: Desktop Nav ── */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>

            {/* Home */}
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={cn(pathname === urls.home && 'bg-primary/10 text-primary')}
              >
                Home
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        href={urls.home}
                        className="relative flex h-full w-full overflow-hidden rounded-md no-underline outline-none focus:shadow-md"
                      >
                        {tenant.logo ? (
                          <Image
                            src={tenant.logo}
                            alt={tenant.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                            <span className="text-4xl font-bold text-primary">
                              {tenant.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          {tenant.heroTitle && (
                            <p className="text-white/70 text-xs mb-1 line-clamp-1">
                              {tenant.heroTitle}
                            </p>
                          )}
                          <p className="text-white text-sm font-semibold leading-tight flex items-center gap-1">
                            {tenant.name}
                            <ArrowUpRight className="h-4 w-4 text-white" />
                          </p>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li className="p-3">
                    <p className="text-xs text-muted-foreground mb-3">Reach us through:</p>
                    <div className="grid gap-2">
                      {contactInfo.map((info) => (
                        <div key={info.label} className="flex items-start gap-2 p-2 rounded-lg hover:bg-accent transition-colors">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{info.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 break-words">
                              {info.type === 'whatsapp' && (
                                <a
                                  href={`https://wa.me/${info.value!.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-primary transition-colors"
                                >
                                  {info.value}
                                </a>
                              )}
                              {info.type === 'address' && info.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <Link href={urls.path('/contact')} className="text-sm text-primary hover:underline">
                        View contact page
                      </Link>
                    </div>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Featured */}
            <NavigationMenuItem>
              <Link
                href={urls.path('/about')}
                className={cn(
                  navigationMenuTriggerStyle(),
                  'flex items-center gap-2',
                  pathname === urls.path('/about') && 'bg-primary/10 text-primary'
                )}
              >
                <Rocket className="h-4 w-4" />
                Featured
              </Link>
            </NavigationMenuItem>

            {/* Products */}
            <NavigationMenuItem>
              <Link
                href={urls.products()}
                className={cn(
                  navigationMenuTriggerStyle(),
                  'flex items-center gap-2',
                  pathname.startsWith(urls.products()) && 'bg-primary/10 text-primary'
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Products
              </Link>
            </NavigationMenuItem>

          </NavigationMenuList>
        </NavigationMenu>

        {/* ── RIGHT: Mobile Hamburger ── */}
        <div className="md:hidden ml-auto">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-4">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== urls.home && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'px-4 py-3 text-base font-medium rounded-lg transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}