'use client';

// ============================================================================
// STORE HEADER
// File: src/components/layout/store/store-header.tsx
//
// [NAV REWORK — 2026-05-13]
//   - "Home" renamed to "About" (i18n key: nav.about)
//   - Nav simplified to 3 items: About | Products | Contact (centered)
//   - "Contact" still scrolls to #contact anchor on landing page
//
// [LAYOUT v2 — 2026-05-13]
//   Three-column header:
//     LEFT   : SaveStatusPill (auth-only) — moved here from floating top
//     CENTER : nav (About · Contact · Products)
//     RIGHT  : Studio icon button — auth-only
//
// [NAV REORDER + STUDIO ICON SYNC — 2026-05-13b]
//   - Center nav order changed: About · Contact · Products
//     (Contact in the middle, Products on the right)
//   - Studio button: `Layout` icon + "Studio" label (kept the label
//     per design feedback — icon-only was too ambiguous next to the
//     hamburger). The Layout icon matches the dashboard sidebar's
//     Studio entry. The sidebar's mapping is:
//       Products → LayoutDashboard
//       Studio   → Layout
//     Mirroring this in the header keeps the user's mental model
//     identical whether they're inside the dashboard sidebar or out
//     in the storefront header.
//   - Products nav link keeps its LayoutDashboard icon for the same
//     reason — sidebar parity.
//   - Old RefreshCw icon swapped for Layout.
// ============================================================================

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Menu, LayoutDashboard, Layout, ArrowUpRight } from 'lucide-react';
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
import { useIsAuthenticated } from '@/stores/auth-store';
import { useBuilderStore } from '@/hooks/dashboard/use-builder-store';
import { SaveStatusPill } from '@/components/dashboard/studio/save-status-pill';
import { cn } from '@/lib/shared/utils';
import type { PublicTenant } from '@/types/tenant';

interface StoreHeaderProps {
  tenant: PublicTenant;
}

export function StoreHeader({ tenant }: StoreHeaderProps) {
  const t = useTranslations('store.header');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const urls = useStoreUrls(tenant.slug);
  const isAuthenticated = useIsAuthenticated();

  // Pull save state from builder store — populated by /dashboard/studio page.
  // On non-studio pages these stay false → pill stays idle → renders null.
  const hasUnsavedChanges = useBuilderStore((s) => s.hasUnsavedChanges);

  // Contact nav → scroll anchor on landing page (works cross-page too)
  const contactHref = `${urls.home}#contact`;

  // [NAV REORDER] About → Contact → Products
  // Mobile sheet follows the same order for consistency with desktop.
  const navItems = [
    { label: t('nav.about'), href: urls.home },
    { label: t('nav.contact'), href: contactHref },
    { label: t('nav.products'), href: urls.products() },
  ];

  const contactInfo = [
    { label: t('whatsapp'), value: tenant.whatsapp, type: 'whatsapp' as const },
    { label: t('address'), value: tenant.address, type: 'address' as const },
  ].filter(item => item.value);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">

        {/* ── LEFT: SaveStatusPill (auth-only) ── */}
        <div className="flex-1 flex items-center justify-start">
          {isAuthenticated && (
            <SaveStatusPill
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={false}
            />
          )}
        </div>

        {/* ── CENTER: Desktop Nav — About · Contact · Products ── */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>

            {/* About (formerly Home) — keeps the mega-menu dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={cn(pathname === urls.home && 'bg-primary/10 text-primary')}
              >
                {t('nav.about')}
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
                    <p className="text-xs text-muted-foreground mb-3">{t('reachUs')}</p>
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
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Contact — CENTER, anchor scroll to #contact section */}
            <NavigationMenuItem>
              <Link
                href={contactHref}
                className={navigationMenuTriggerStyle()}
              >
                {t('nav.contact')}
              </Link>
            </NavigationMenuItem>

            {/* Products — RIGHT, with LayoutDashboard icon (matches sidebar) */}
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
                {t('nav.products')}
              </Link>
            </NavigationMenuItem>

          </NavigationMenuList>
        </NavigationMenu>

        {/* ── RIGHT (desktop): Studio button — auth-only ──
             Layout icon + "Studio" label. Icon matches the dashboard
             sidebar's Studio entry for visual continuity across surfaces. */}
        <div className="hidden md:flex flex-1 items-center justify-end">
          {isAuthenticated && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="gap-1.5 h-9 text-xs"
            >
              <Link href="/dashboard/studio">
                <Layout className="h-3.5 w-3.5" />
                {t('nav.studio')}
              </Link>
            </Button>
          )}
        </div>

        {/* ── MOBILE: Studio (auth-only) + Hamburger ──
             Icon + label, same as desktop. On very narrow screens the
             label hides via `hidden sm:inline` so the icon alone stays
             tappable next to the hamburger. */}
        <div className="md:hidden ml-auto flex items-center gap-2">
          {isAuthenticated && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="gap-1.5 h-9 text-xs"
            >
              <Link href="/dashboard/studio">
                <Layout className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('nav.studio')}</span>
              </Link>
            </Button>
          )}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('menuLabel')}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t('menuLabel')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-4">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== urls.home && !item.href.includes('#') && pathname.startsWith(item.href));
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
