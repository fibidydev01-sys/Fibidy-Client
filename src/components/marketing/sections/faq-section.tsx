// ==========================================
// FAQ SECTION
// File: src/components/marketing/sections/faq-section.tsx
//
// Phase 5 polish v16 (May 2026 — per-section grid rhythm):
//
// CHANGED in v16:
//   - GRID_PATTERN_STYLE local declaration REMOVED.
//   - Now uses createGridStyle({ intensity: 'subtle', mask: 'fade-bottom' }).
//     Rationale:
//       * subtle intensity (0.30 / dark 0.15) — accordion section bisa
//         panjang (8 items × ~80px = ~640px). Kalau grid terlalu jelas,
//         keliatan "wallpaper". Subtle bikin grid jadi texture, bukan
//         pattern yang mendominasi.
//       * fade-bottom → grid menghilang ke arah final CTA di bawah,
//         menyiapkan transisi visual ke closing yang lebih punchy.
//
// PRESERVED from v15.9:
//   - Vercel-open layout (header block + accordion block).
//   - max-w-3xl untuk kedua block (alignment ketat).
//   - Padding lives inside FaqItem (px-6 md:px-8) so dividers run
//     flush plate-edge to plate-edge.
//   - [&>*:last-child]:border-b-0 — clears last AccordionItem's border.
//   - shadcn Accordion type="single" collapsible.
//   - Visible text in DOM (SEO + JSON-LD via MarketingSchema).
// ==========================================

import { getTranslations } from 'next-intl/server';
import { Accordion } from '@/components/ui/accordion';
import { SectionEyebrow } from '@/components/marketing/shared/section-eyebrow';
import {
  CornerCrosses,
  createGridStyle,
} from '@/components/marketing/shared/line-grid-frame';
import { FaqItem } from '@/components/marketing/shared/faq-item';
import { faqItems } from '@/lib/data/marketing/faq';
import { cn } from '@/lib/shared/utils';

// ──────────────────────────────────────────────────────────────────
// SECTION GRID CONFIG
// subtle + fade-bottom → quietest grid, accordion stays focal
// ──────────────────────────────────────────────────────────────────
const GRID = createGridStyle({ intensity: 'subtle', mask: 'fade-bottom' });

export async function FaqSection() {
  const t = await getTranslations('marketing.faq');

  return (
    <section
      id="faq"
      className="relative scroll-mt-20 overflow-hidden bg-background py-20 md:py-28"
    >
      {/* Section-level grid background */}
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0', GRID.className)}
        style={GRID.style}
      />

      <div className="container relative mx-auto px-4">
        {/* BLOCK A — HEADER */}
        <div className="relative mx-auto max-w-3xl border-y bg-background">
          <CornerCrosses />
          <div className="px-6 py-10 text-center md:py-14">
            <SectionEyebrow>{t('eyebrow')}</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {t('headline')}
            </h2>
          </div>
        </div>

        {/* BLOCK B — ACCORDION */}
        <div className="relative mx-auto mt-8 max-w-3xl border-y bg-background md:mt-10">
          <CornerCrosses />
          <Accordion
            type="single"
            collapsible
            className="w-full [&>*:last-child]:border-b-0"
          >
            {faqItems.map((item) => (
              <FaqItem
                key={item.id}
                id={item.id}
                question={t(`items.${item.id}.q`)}
                answer={t(`items.${item.id}.a`)}
              />
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}