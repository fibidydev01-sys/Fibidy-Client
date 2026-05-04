// ==========================================
// PROBLEM SECTION
// File: src/components/marketing/sections/problem-section.tsx
//
// Three pain bullets that resonate with UMKM before pivoting to
// Features. Layout: eyebrow + headline at top, three icon+text
// rows below.
//
// Server component — no interactivity, no client hooks. Saves
// bundle size and lets RSC stream the markup directly.
//
// Compact by design (variant="tight") so it doesn't dominate the
// page between Hero and Features.
// ==========================================

import { getTranslations } from 'next-intl/server';
import { SectionShell } from '@/components/marketing/shared/section-shell';
import { SectionEyebrow } from '@/components/marketing/shared/section-eyebrow';
import { problemItems } from '@/lib/data/marketing/problem';

export async function ProblemSection() {
  const t = await getTranslations('marketing.problem');

  return (
    <SectionShell variant="tight" bgClassName="bg-muted/30">
      <div className="mx-auto max-w-3xl text-center">
        <SectionEyebrow>{t('eyebrow')}</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          {t('headline')}
        </h2>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
        {problemItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex flex-col items-start gap-3 rounded-2xl border bg-card p-6"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="text-base font-semibold">
                {t(`items.${item.id}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(`items.${item.id}.description`)}
              </p>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
