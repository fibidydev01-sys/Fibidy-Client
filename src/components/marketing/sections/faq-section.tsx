// ==========================================
// FAQ SECTION
// File: src/components/marketing/sections/faq-section.tsx
//
// Accordion of 8 questions. Visible text in DOM (not behind tabs/
// images) for SEO + AI agent crawling. Same items also feed the
// FAQPage JSON-LD via MarketingSchema.
//
// shadcn Accordion type="single" collapsible — only one open at a
// time, all closed initially. Mobile-friendly tap targets.
//
// Server component.
// ==========================================

import { getTranslations } from 'next-intl/server';
import { Accordion } from '@/components/ui/accordion';
import { SectionShell } from '@/components/marketing/shared/section-shell';
import { SectionEyebrow } from '@/components/marketing/shared/section-eyebrow';
import { FaqItem } from '@/components/marketing/shared/faq-item';
import { faqItems } from '@/lib/data/marketing/faq';

export async function FaqSection() {
  const t = await getTranslations('marketing.faq');

  return (
    <SectionShell id="faq" bgClassName="bg-muted/30">
      <div className="mx-auto max-w-3xl text-center">
        <SectionEyebrow>{t('eyebrow')}</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {t('headline')}
        </h2>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
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
    </SectionShell>
  );
}
