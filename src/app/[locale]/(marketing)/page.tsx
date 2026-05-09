// ==========================================
// MARKETING PAGE (root /)
// File: src/app/[locale]/(marketing)/page.tsx
//
// Phase 10 (May 2026 — registry-driven render):
//
// Rebuilt from 115 lines of imperative JSX (one block per section)
// into a thin registry-iterating component. Render order, mode
// toggle, and active section list now live entirely at
// `lib/marketing/data/sections.ts`. This file's only job is to
// look each key up in the registry and render whatever it points at.
//
// BEFORE Phase 10:
//   - 115 lines
//   - 10 explicit imports (one per section component)
//   - 10 conditional renders (each ACTIVE_SECTIONS.includes(key) check)
//   - Comment-block listing TODOs for disabled sections
//   - Local declaration of ACTIVE_SECTIONS shadowing the data export
//
// AFTER Phase 10:
//   - ~50 lines
//   - 2 imports (ACTIVE_SECTIONS + SECTION_REGISTRY)
//   - 1 .map() that does the work
//   - generateMetadata unchanged
//
// WHY THE COMPONENT REGISTRY LIVES SEPARATELY:
//   `components/marketing/registry.ts` is consumed BY this page,
//   but also conceptually anchors which sections "exist" in the
//   marketing route group. Splitting it out:
//     1. Makes adding a section a 1-line registry edit (no page edit)
//     2. Lets the type system enforce exhaustiveness on SectionKey
//     3. Keeps page.tsx focused on metadata + render, not wiring
//
// TO RESTORE FULL PAGE COMPOSITION:
//   Edit lib/marketing/data/sections.ts:
//     `ACTIVE_SECTIONS: readonly SectionKey[] = MINIMAL_SECTIONS;`
//   →
//     `ACTIVE_SECTIONS: readonly SectionKey[] = FULL_SECTIONS;`
//   That's the full restore. No JSX edits anywhere.
// ==========================================

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ACTIVE_SECTIONS } from '@/lib/marketing/data/sections';
import { SECTION_REGISTRY } from '@/components/marketing/registry';

// ==========================================
// METADATA
// ==========================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'marketing.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

// ==========================================
// PAGE
// ==========================================

export default function MarketingPage() {
  return (
    <>
      {ACTIVE_SECTIONS.map((key) => {
        const Section = SECTION_REGISTRY[key];
        // SECTION_REGISTRY is typed Record<SectionKey, ComponentType>,
        // so this lookup is always defined. Defensive null-check kept
        // anyway — if SectionKey grows ahead of registry entries
        // during a future refactor, the page degrades gracefully
        // instead of crashing.
        return Section ? <Section key={key} /> : null;
      })}
    </>
  );
}
