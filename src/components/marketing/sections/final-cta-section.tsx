// ==========================================
// FINAL CTA SECTION
// File: src/components/marketing/sections/final-cta-section.tsx
//
// One section, one button. Same primary CTA as the hero (same label,
// same href) — repetition is intentional, not lazy. Per HANDOFF
// §4.1 + KlientBoost research: multiple CTAs in this position kill
// conversion (-266%).
//
// Background: subtle gradient on top of the muted base, centered
// content, generous vertical padding to give the CTA breathing room.
//
// Server component.
// ==========================================

import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { SectionShell } from '@/components/marketing/shared/section-shell';
import { finalCta } from '@/lib/data/marketing/cta';

export async function FinalCtaSection() {
  const t = await getTranslations('marketing.finalCta');

  return (
    <SectionShell>
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-background px-6 py-16 text-center md:px-12 md:py-20">
        {/* Decorative pink halo */}
        <div
          aria-hidden
          className="absolute left-1/2 top-0 -z-10 h-48 w-[60%] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
        />

        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {t('headline')}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {t('subheadline')}
        </p>

        <div className="mt-8 flex justify-center">
          <Button asChild size="lg" className="group min-w-[220px]">
            <Link href={finalCta.ctaHref}>
              {t('ctaPrimary')}
              <ArrowRight
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </Button>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">{t('trustLine')}</p>
      </div>
    </SectionShell>
  );
}
