// ==========================================
// HERO SECTION (top of marketing page)
// File: src/components/marketing/sections/hero/index.tsx
//
// [CLEANUP — May 2026]
// Text column (eyebrow, headline, subheadline, CTA, trustLine) DIHAPUS.
// Sisakan VideoPlaceholder saja, ditaruh fullwidth center.
// ==========================================

import { getTranslations } from 'next-intl/server';
import { hero } from '@/lib/marketing/data/hero';
import { VideoPlaceholder } from './video-placeholder';

export async function HeroSection() {
  const t = await getTranslations('marketing.hero');

  return (
    <section
      id="hero"
      className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-primary/[0.05] via-background to-background"
    >
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-28 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <VideoPlaceholder label={t('videoPlaceholder')} />
        </div>
      </div>
    </section>
  );
}