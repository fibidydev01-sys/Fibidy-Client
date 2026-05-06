'use client';

// ==========================================
// HERO SECTION
// File: src/components/marketing/sections/hero-section.tsx
//
// Composition follows the LandingRabbit who/what/why framework:
//   eyebrow      → who is this for (Magic UI announcement pill)
//   headline     → what (two-line: static prefix + WordRotate noun)
//   subheadline  → how (Stripe-style declarative sentence)
//   CTA pair     → primary RainbowButton / secondary outline anchor
//   trust line   → reassurance row
//   visual       → Browser-mockup-framed StorefrontMockup
//
// Phase 5 polish v10 (May 2026 — Magic UI parity + cleaner copy):
//
// CHANGED:
//   1. Eyebrow now matches the canonical Magic UI animated-gradient-
//      text DEMO exactly (the orange→purple animated gradient border
//      via CSS masking, an icon, vertical divider, AnimatedGradientText
//      span, and a ChevronRight). Replaces v9's simpler pill. The
//      🎉 emoji from the demo is swapped for a Lucide <Rocket> icon —
//      same role, full Tailwind color control, no platform rendering
//      surprises.
//
//   2. Headline restructured to a two-line layout:
//         Line 1 — static "Open your" / "Buka"   (text-foreground)
//         Line 2 — WordRotate cycling the noun   (text-primary, bold)
//      WordRotate replaces v9's MorphingText. The visual difference:
//      MorphingText was an SVG-filter morph of full sentences (heavy
//      anti-aliasing, restricted to short strings). WordRotate is a
//      framer-motion crossfade of single words — lighter, snappier,
//      and the rotating word reads as the focal point because it sits
//      isolated on its own line.
//
//      "Open your" stays anchored, the rotating word is what changes
//      visit-to-visit and frame-to-frame. Classic Stripe / Airbnb
//      copy pattern.
//
//   3. i18n shape change:
//        hero.headlinePrefix  → "Open your" / "Buka"  (NEW key)
//        hero.headlineMorph   → ["cafe.", "salon.", ...] (REPURPOSED:
//                              now nouns only, was full sentences)
//        hero.headline        → kept untouched (sr-only fallback +
//                              defensive fallback if i18n drifts)
//
// PRESERVED from v9:
//   - Single soft pink gradient background
//   - 1fr_1.1fr two-column layout
//   - BrowserMockup wrapper around StorefrontMockup
//   - RainbowButton primary CTA via onClick + router.push
//   - Outline secondary CTA via asChild + plain <a> for #anchor
//   - framer-motion 80ms stagger / 500ms fadeUp entrance
//   - Stripe-style subheadline (the "how"); proof points stay in
//     the trust line below CTAs
// ==========================================

import { ArrowRight, ChevronRight, Rocket } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { WordRotate } from '@/components/ui/word-rotate';
import { BrowserMockup } from '@/components/marketing/shared/browser-mockup';
import { StorefrontMockup } from '@/components/marketing/shared/storefront-mockup';
import { hero } from '@/lib/data/marketing/hero';
import { cn } from '@/lib/shared/utils';

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
  const router = useRouter();

  // Pull the rotating-noun array. Defensive cast — if i18n drifts and
  // the key isn't an array, fall back to a single-word array so
  // WordRotate has something to render.
  const morphRaw = t.raw('headlineMorph');
  const morphTexts: string[] = Array.isArray(morphRaw)
    ? (morphRaw as string[])
    : ['store.'];

  return (
    <section className="relative isolate overflow-hidden">
      {/* ── BACKGROUND — single soft gradient base ── */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.05] via-background to-background"
      />

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-28">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16"
        >
          {/* ── TEXT COLUMN ── */}
          <div className="text-center lg:text-left">
            {/*
              ── EYEBROW — Magic UI animated-gradient-text demo pattern ──
              Mirrors the canonical demo from magicui.design exactly
              (orange→purple animated gradient border via CSS masking,
              icon, vertical divider, AnimatedGradientText span,
              ChevronRight) with one swap: 🎉 → Lucide <Rocket />.
              The pill is `inline-flex` so it sits content-width; the
              parent flex handles centering on mobile and left-align
              on lg+.
            */}
            <motion.div
              variants={fadeUp}
              className="flex justify-center lg:justify-start"
            >
              <div className="group relative inline-flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]">
                <span
                  className={cn(
                    'animate-gradient absolute inset-0 block h-full w-full rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]',
                  )}
                  style={{
                    WebkitMask:
                      'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'destination-out',
                    mask:
                      'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'subtract',
                    WebkitClipPath: 'padding-box',
                  }}
                />
                <Rocket
                  className="size-4 text-neutral-700 dark:text-neutral-300"
                  aria-hidden
                />
                <hr className="mx-2 h-4 w-px shrink-0 bg-neutral-500" />
                <AnimatedGradientText className="text-sm font-medium">
                  {t('eyebrow')}
                </AnimatedGradientText>
                <ChevronRight
                  className="ml-1 size-4 stroke-neutral-500 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5"
                  aria-hidden
                />
              </div>
            </motion.div>

            {/*
              ── HEADLINE — two-line layout ──
              Line 1: static prefix in foreground color.
              Line 2: WordRotate cycling the noun, BOLD, in primary
              color. The semantic <h1> wraps both — WordRotate's
              internal <motion.h1> nests, which is technically
              non-strict HTML but every modern browser handles it
              gracefully and crawlers index the outer h1's text on
              first paint.
            */}
            <motion.h1
              variants={fadeUp}
              className="mt-5 text-4xl font-bold tracking-tight leading-[1.1] md:text-5xl lg:text-6xl"
            >
              <span className="block text-foreground">
                {t('headlinePrefix')}
              </span>
              <span className="block">
                <WordRotate
                  words={morphTexts}
                  className={cn(
                    // WordRotate has its own font sizing baked in;
                    // override to inherit our heading scale and color.
                    '!text-4xl md:!text-5xl lg:!text-6xl',
                    '!font-bold !tracking-tight !leading-[1.1]',
                    '!text-primary',
                  )}
                />
              </span>
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
              {/*
                Primary CTA — RainbowButton via onClick + router.push.
                RainbowButton doesn't expose asChild, so we navigate
                programmatically. Loses Link's prefetch but keeps the
                semantics clean (no <a><button> nesting).
              */}
              <RainbowButton
                className="group h-11 min-w-[200px] text-sm font-semibold"
                onClick={() => router.push(hero.ctaPrimaryHref)}
              >
                {t('ctaPrimary')}
                <ArrowRight
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </RainbowButton>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="min-w-[180px]"
              >
                {/*
                  Plain <a> for same-page anchor. Lenis (mounted in
                  marketing layout) handles smooth scroll, scroll-mt-20
                  on SectionShell handles sticky-header offset.
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

          {/* ── VISUAL COLUMN — Browser-wrapped storefront ── */}
          <motion.div
            variants={fadeUp}
            className="relative mx-auto w-full max-w-[640px] lg:max-w-none"
          >
            <BrowserMockup url="tokokopi.fibidy.com">
              <StorefrontMockup />
            </BrowserMockup>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
