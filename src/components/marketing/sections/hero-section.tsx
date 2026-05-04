'use client';

// ==========================================
// HERO SECTION
// File: src/components/marketing/sections/hero-section.tsx
//
// The most important real estate on the page — visitors decide in
// <8 seconds whether to keep reading. Composition follows the
// LandingRabbit who/what/why framework:
//
//   eyebrow      → who is this for ("Untuk UMKM Indonesia")
//   headline     → what (≤8 words, benefit-led, action verb)
//   subheadline  → why (1-2 sentences, value reinforcement)
//   CTA pair     → primary "Buka Toko Gratis" / secondary "Lihat demo"
//   trust line   → "Gratis selamanya · Tanpa kartu kredit · 5 menit"
//   visual       → StorefrontMockup component (replace with real
//                  screenshot when available)
//
// Why client component: framer-motion needs the client. The static
// content underneath would happily SSR, but pulling motion out
// would split this into a server-shell + client-island ceremony
// for marginal gain. Keep it client.
//
// Animation: entrance fade + slide-up, stagger 80ms. `whileInView`
// with `once: true` so it fires once per page load. prefers-reduced-
// motion respected via framer's automatic handling.
//
// [PHASE 4 — May 2026]
// Secondary CTA — was `<Link href="/login">` (duplicated header Sign in,
// anti-pattern from HANDOFF #2 §5 #11). Now `<a href="#store-builder">`
// scrolling to the Interactive Store Builder section. Plain `<a>` is
// used (not i18n Link) because same-page anchor hrefs don't need locale
// prefixing — they preserve the current locale by definition.
//
// [PHASE 4 PATCH — framer-motion v12 typing]
// Variant objects must be explicitly typed as `Variants` from
// framer-motion. Inline literal `ease: 'easeOut'` would otherwise widen
// to `string` and fail the v12 `Easing` union check (motion-dom@12.x
// tightened the inferred Transition shape). With `: Variants` annotation,
// TS uses contextual typing on the literal and accepts it as a member
// of the Easing union.
// ==========================================

import { ArrowRight } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { StorefrontMockup } from '@/components/marketing/shared/storefront-mockup';
import { hero } from '@/lib/data/marketing/hero';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export function HeroSection() {
  const t = useTranslations('marketing.hero');

  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient backdrop — Vercel-vibes restraint, not over-saturation */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.04] via-background to-background"
      />

      {/* Subtle dot pattern — half opacity of typical Vercel grid */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.4] [background-image:radial-gradient(circle_at_1px_1px,_var(--border)_1px,_transparent_0)] [background-size:24px_24px]"
      />

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-28">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
        >
          {/* Text column */}
          <div className="text-center lg:text-left">
            <motion.p
              variants={fadeUp}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-primary"
            >
              {t('eyebrow')}
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="mt-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
            >
              {t('headline')}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg lg:mx-0"
            >
              {t('subheadline')}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Button asChild size="lg" className="group min-w-[180px]">
                <Link href={hero.ctaPrimaryHref}>
                  {t('ctaPrimary')}
                  <ArrowRight
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="min-w-[180px]"
              >
                {/*
                  [PHASE 4] Plain <a> for same-page anchor — Lenis handles
                  smooth scroll, scroll-mt-20 on SectionShell handles the
                  sticky-header offset, and we avoid the i18n Link locale
                  prefixing issue with hash-only hrefs.
                */}
                <a href={hero.ctaSecondaryHref}>{t('ctaSecondary')}</a>
              </Button>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="mt-5 text-xs text-muted-foreground"
            >
              {t('trustLine')}
            </motion.p>
          </div>

          {/* Visual column — StorefrontMockup with hover float */}
          <motion.div
            variants={fadeUp}
            className="relative mx-auto w-full max-w-[480px] lg:max-w-none"
          >
            <StorefrontMockup />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}