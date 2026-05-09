// ==========================================
// STORE BUILDER SECTION (slim server composer)
// File: src/components/marketing/sections/store-builder/index.tsx
//
// Phase 8 (May 2026 — section orchestration extraction):
//
// Server composer. Resolves i18n on the server via getTranslations,
// renders section chrome (SectionShell + header), and hands off to
// the client form-island with pre-translated label props.
//
// BEFORE Phase 8:
//   - 337-line client component (full 'use client')
//   - useTranslations hook resolved labels on the client
//   - Form state, validation, navigation, NextStep tour all inline
//
// AFTER Phase 8:
//   - ~80-line server component (no 'use client')
//   - getTranslations resolves labels at request time on the server
//   - Form orchestration extracted to use-store-builder.ts hook
//   - Client island form-island.tsx wraps the hook + sub-components
//
// Bundle impact: ~30-40% client JS reduction for this section.
// Header, eyebrow, subheadline = pure HTML now (no hydration tax).
//
// PRESERVED INVARIANTS (DO NOT TOUCH):
//   - SectionShell with id="store-builder" (anchor for Hero ctaSecondary)
//   - Header layout: eyebrow + h2 + subheadline, max-w-3xl, centered
//   - Bridge URL contract handled in the hook (see use-store-builder.ts)
//   - Q17 SoT guard handled at lib/data/marketing/store-builder.ts
//     module load (this file imports nothing from there directly)
//
// WHAT THIS FILE MUST NEVER DO:
//   - Import any client-only thing (useState, framer-motion, useRouter)
//   - Inline form logic
//   - Have a 'use client' directive
//
// If you find yourself wanting to add interactivity here, add it to
// form-island.tsx instead — that's what the boundary is for.
// ==========================================

import { getTranslations } from 'next-intl/server';
import { SectionShell } from '@/components/marketing/primitives/section-shell';
import { SectionEyebrow } from '@/components/marketing/primitives/section-eyebrow';
import {
  StoreBuilderFormIsland,
  type StoreBuilderFormLabels,
} from './form-island';

export async function StoreBuilderSection() {
  const t = await getTranslations('marketing.storeBuilder');

  // Pre-resolve every string the form-island needs. Sub-components
  // (CategoryPicker, SubdomainInput, etc.) keep their own
  // useTranslations — the prop surface here is intentionally narrow,
  // covering only this file's own copy (agreement legal text, CTA
  // label, trust line, preview URL placeholder).
  const labels: StoreBuilderFormLabels = {
    agreementPrefix: t('agreement.prefix'),
    termsLink: t('agreement.termsLink'),
    agreementAnd: t('agreement.and'),
    privacyLink: t('agreement.privacyLink'),
    ctaPrimary: t('ctaPrimary'),
    trustLine: t('trustLine'),
    previewPlaceholderSlug: t('preview.placeholderSlug'),
  };

  return (
    <SectionShell id="store-builder">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <SectionEyebrow>{t('eyebrow')}</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {t('headline')}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {t('subheadline')}
        </p>
      </div>

      {/* Form + preview + sticky mobile CTA — all client-side */}
      <StoreBuilderFormIsland labels={labels} />
    </SectionShell>
  );
}
