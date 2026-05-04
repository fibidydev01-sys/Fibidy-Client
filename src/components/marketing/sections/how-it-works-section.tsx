// ==========================================
// HOW IT WORKS SECTION
// File: src/components/marketing/sections/how-it-works-section.tsx
//
// Three numbered steps, horizontal on desktop (md+) and stacked on
// mobile. Each step gets a circle with the index, an icon, a title,
// a 1-sentence description.
//
// Subtle connector line between desktop steps using a border-top on
// the parent container — invisible at mobile via responsive utility.
//
// Sequential by nature, so we use 1-indexed numbering visible to the
// user (per Shopify pattern in HANDOFF §2.7).
//
// Server component.
// ==========================================

import { getTranslations } from 'next-intl/server';
import { SectionShell } from '@/components/marketing/shared/section-shell';
import { SectionEyebrow } from '@/components/marketing/shared/section-eyebrow';
import { howItWorksSteps } from '@/lib/data/marketing/how-it-works';

export async function HowItWorksSection() {
  const t = await getTranslations('marketing.howItWorks');

  return (
    <SectionShell id="how-it-works">
      <div className="mx-auto max-w-3xl text-center">
        <SectionEyebrow>{t('eyebrow')}</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {t('headline')}
        </h2>
      </div>

      <div className="relative mx-auto mt-14 grid max-w-5xl gap-10 md:grid-cols-3 md:gap-6">
        {howItWorksSteps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="relative flex flex-col items-center text-center md:items-start md:text-left"
            >
              {/* Step number badge */}
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {step.index}
                </span>
                <Icon
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden
                />
              </div>

              <h3 className="mt-5 text-xl font-semibold tracking-tight">
                {t(`steps.${step.id}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                {t(`steps.${step.id}.description`)}
              </p>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
