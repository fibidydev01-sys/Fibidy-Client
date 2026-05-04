// ==========================================
// MARKETING HEADER
// File: src/components/marketing/marketing-header.tsx
//
// [VERCEL-STYLE — May 2026 REBUILD]
// Sticky header for the (marketing) route group. Composition:
//
//   Desktop:  [Logo] ────── [Nav links] [Sign in] [Buka Toko Gratis]
//   Mobile:   [Logo] ────────────────────────────────── [Hamburger]
//
// Locale switcher and theme toggle are DELIBERATELY NOT in the
// header. They live in the footer alongside legal/social — same
// convention as Vercel, Linear, Stripe, Geist. Header stays clean
// for the single primary CTA.
//
// Mobile: hamburger opens a Sheet drawer from the right with nav
// links + sign in + primary CTA. No locale/theme in the drawer
// either — drawer mirrors the desktop header content exactly.
//
// Backdrop-blur over translucent background so content scrolls
// under it (Vercel pattern). Border-bottom subtle for separation.
// ==========================================

import { Menu } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { AuthLogo } from '@/components/layout/auth/auth-logo';
import { headerNav } from '@/lib/data/marketing/nav';

export async function MarketingHeader() {
  const t = await getTranslations('marketing.header');

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <AuthLogo size="sm" />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {headerNav.map((link) => (
            <Link
              key={link.labelKey}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(`nav.${link.labelKey}`)}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">{t('ctaSignIn')}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">{t('ctaPrimary')}</Link>
          </Button>
        </div>

        {/* Mobile hamburger → Sheet drawer */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('menuOpen')}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%] max-w-sm">
            <SheetHeader className="text-left">
              <SheetTitle>
                <AuthLogo size="sm" />
              </SheetTitle>
              <SheetDescription className="sr-only">
                {t('menuOpen')}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-8 flex flex-col gap-1">
              {headerNav.map((link) => (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  className="rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {t(`nav.${link.labelKey}`)}
                </Link>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2 border-t pt-6">
              <Button asChild variant="outline" size="lg">
                <Link href="/login">{t('ctaSignIn')}</Link>
              </Button>
              <Button asChild size="lg">
                <Link href="/register">{t('ctaPrimary')}</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
