// ==========================================
// MARKETING HERO
// File: src/components/marketing/marketing-hero.tsx
//
// [VERCEL VIBES — May 2026]
// Foundation hero for the (marketing) landing page. Server component.
//
// Layout: centered headline + subheading + dual CTA (primary "Get
// started" → /register, secondary "Sign in" → /login). Subtle gradient
// backdrop tying into the existing brand `primary` color token used
// throughout auth.
//
// Intentionally placeholder content — the goal of this iteration is
// to give Phase 1 a real `/` instead of a 404, not to ship a full
// marketing site. Future iterations will layer features, social proof,
// pricing, etc.
//
// i18n keys required:
//   marketing.hero.heading
//   marketing.hero.subheading
//   marketing.hero.cta            (primary)
//   marketing.hero.ctaSecondary   (secondary — currently "Sign in")
// ==========================================

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';

interface MarketingHeroProps {
  locale: string;
}

export async function MarketingHero({ locale }: MarketingHeroProps) {
  const t = await getTranslations({ locale, namespace: 'marketing.hero' });

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background -z-10"
      />

      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {t('heading')}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {t('subheading')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button asChild size="lg" className="group min-w-[180px]">
              <Link href="/register">
                {t('cta')}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-w-[180px]"
            >
              <Link href="/login">{t('ctaSecondary')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
