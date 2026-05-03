// ==========================================
// MARKETING HEADER
// File: src/components/marketing/marketing-header.tsx
//
// [VERCEL VIBES — May 2026]
// Server component. Renders at the top of every (marketing) route.
// Sticky to the viewport top; backdrop-blur over a translucent bg so
// content scrolls under it.
//
// Two CTAs:
//   - "Sign in"   → /login  (ghost, secondary visual weight)
//   - "Register"  → /register  (filled, primary CTA)
//
// Logo reuses <AuthLogo> at size="sm" — same component used in the
// auth layout, so brand consistency carries through end-to-end.
//
// i18n keys required (added in json-patch.md):
//   marketing.header.login
//   marketing.header.register
// ==========================================

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { AuthLogo } from '@/components/layout/auth/auth-logo';

interface MarketingHeaderProps {
  locale: string;
}

export async function MarketingHeader({ locale }: MarketingHeaderProps) {
  const t = await getTranslations({ locale, namespace: 'marketing.header' });

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <AuthLogo size="sm" />

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">{t('login')}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">{t('register')}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
