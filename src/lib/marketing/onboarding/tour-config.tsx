'use client';

// ==========================================
// MARKETING TOUR CONFIG
// File: src/lib/marketing/onboarding/tour-config.tsx
//
// Phase 9 (May 2026 — onboarding co-location):
//
// Owns the NextStep tour definitions for the (marketing) route group.
// Exports a hook factory `useMarketingTours()` rather than a static
// array because step content needs translated strings via
// `useTranslations` — translations are a per-render concern, not a
// module-load concern.
//
// MIGRATED FROM:
//   src/lib/data/marketing/tours.tsx (now deleted)
//
// SPLIT RATIONALE:
//   - Names + timing constants → tour-names.ts (pure data)
//   - Tour definitions (JSX content) → THIS FILE (needs hooks)
//   - Provider component → tour-provider.tsx (renders + consumes)
//
//   Each file is single-purpose and cheap to swap when a future tour
//   gets added. Adding a dashboard tour ladder won't pollute this
//   file — it'll get its own `lib/dashboard/onboarding/` parallel.
//
// PRESERVED FROM PRE-PHASE-9:
//   - Tour shape (single step, selector '#builder-category-picker',
//     side: 'top', non-interactive auto-dismiss spotlight)
//   - i18n namespace 'marketing.storeBuilder.onboarding.categoryGate'
//     — message keys NOT renamed; even though the tour identifier
//     changed (`category-gate` → `marketing-category-picker`), the
//     i18n key path stays `categoryGate.*` so translators don't have
//     to re-file. Internal tour ID and translation key path are
//     decoupled by design.
//   - showControls: false, showSkip: false (flash spotlight, no UI)
//   - pointerPadding: 12, pointerRadius: 16 (visual cue ring)
// ==========================================

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { NextStepTour } from '@/components/shared/onboarding/nextstep-types';
import { MARKETING_TOURS } from './tour-names';

/**
 * Hook factory returning the marketing tour configuration. Called
 * inside MarketingTourProvider — `useTranslations` re-runs on locale
 * change so tour content stays localized.
 *
 * Memoized via useMemo on `t` so React doesn't see a new array
 * identity on every render (NextStep's internal effects compare
 * the tours prop by reference for setup teardown).
 */
export function useMarketingTours(): NextStepTour[] {
  const t = useTranslations('marketing.storeBuilder.onboarding');

  return useMemo<NextStepTour[]>(
    () => [
      {
        tour: MARKETING_TOURS.CATEGORY_PICKER,
        steps: [
          {
            icon: <span aria-hidden>👇</span>,
            title: t('categoryGate.title'),
            content: <span>{t('categoryGate.content')}</span>,
            // Targets the CategoryPicker root in store-builder section.
            // The id `builder-category-picker` is set on the picker's
            // root <div> in category-picker.tsx — keep them in sync.
            selector: '#builder-category-picker',
            side: 'top',
            // Non-interactive flash spotlight — no controls, no skip.
            // Auto-dismiss timing lives in TOUR_AUTO_CLOSE_MS at
            // tour-names.ts and is triggered by use-store-builder.ts
            // via setTimeout after startNextStep().
            showControls: false,
            showSkip: false,
            pointerPadding: 12,
            pointerRadius: 16,
          },
        ],
      },
    ],
    [t],
  );
}
