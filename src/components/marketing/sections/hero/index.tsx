// ==========================================
// HERO SECTION (top of marketing page)
// File: src/components/marketing/sections/hero/index.tsx
//
// [PHASE 7 SPLIT — May 2026]
//
// CHANGED in Phase 7:
//   1. CONVERTED TO SERVER COMPONENT.
//      - Removed 'use client' directive.
//      - Swapped useTranslations (client hook) → getTranslations
//        (server async). Function signature now `async`.
//
//   2. EXTRACTED into 4 sibling files:
//      * eyebrow-pill.tsx       — server (CSS-only animated gradient)
//      * headline.tsx           — client (WordRotate cycling noun)
//      * cta-pair.tsx           — client (RainbowButton + router.push)
//      * motion-stagger.tsx     — client (framer-motion choreography)
//
//   3. COMPOSER ROLE: pre-resolve translations + hero data on the
//      server, instantiate atomic pieces, hand the assembled tree
//      to HeroMotionStagger which handles entrance choreography.
//
// PRESERVED:
//   - Gradient background (from-primary/[0.05] via-background)
//   - Container layout + py-16/24/28 responsive spacing
//   - StorefrontMockup wrapped in BrowserMockup with tokokopi.fibidy.com URL
//   - Defensive cast for headlineMorph (i18n raw → string[])
//   - Hero data values (ctaPrimaryHref='/register', ctaSecondaryHref='#store-builder')
//
// CLIENT BUNDLE IMPACT:
//   Before: entire hero (~259 lines) was 'use client'
//   After:  composer + eyebrow = server (zero JS)
//           Only headline, cta-pair, motion-stagger ship JS
//           ~50% smaller hero client bundle
// ==========================================

import { getTranslations } from 'next-intl/server';
import { BrowserMockup } from '@/components/marketing/primitives/browser-mockup';
import { hero } from '@/lib/marketing/data/hero';
import { StorefrontMockup } from './storefront-mockup';
import { EyebrowPill } from './eyebrow-pill';
import { Headline } from './headline';
import { CtaPair } from './cta-pair';
import { HeroMotionStagger } from './motion-stagger';

export async function HeroSection() {
  const t = await getTranslations('marketing.hero');

  // ──────────────────────────────────────────────────────────────────
  // i18n RAW EXTRACTION — defensive cast
  //
  // `headlineMorph` is declared as a string[] in messages/{en,id}.json
  // but next-intl's `t.raw()` returns `unknown`. Cast guards against
  // typo'd keys yielding string instead of array (which would crash
  // WordRotate's array.map). At runtime: if morph isn't an array,
  // fall back to single-word array so animation still ticks.
  // ──────────────────────────────────────────────────────────────────
  const morphRaw = t.raw('headlineMorph');
  const morphWords: string[] = Array.isArray(morphRaw)
    ? (morphRaw as string[])
    : [String(morphRaw ?? '')];

  return (
    <section
      id="hero"
      className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-primary/[0.05] via-background to-background"
    >
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-28">
        <HeroMotionStagger
          eyebrow={<EyebrowPill label={t('eyebrow')} />}
          headline={
            <Headline prefix={t('headlinePrefix')} words={morphWords} />
          }
          subheadline={t('subheadline')}
          ctaPair={
            <CtaPair
              primaryLabel={t('ctaPrimary')}
              secondaryLabel={t('ctaSecondary')}
              primaryHref={hero.ctaPrimaryHref}
              secondaryHref={hero.ctaSecondaryHref}
            />
          }
          trustLine={t('trustLine')}
          visual={
            <BrowserMockup url="tokokopi.fibidy.com">
              <StorefrontMockup />
            </BrowserMockup>
          }
        />
      </div>
    </section>
  );
}
