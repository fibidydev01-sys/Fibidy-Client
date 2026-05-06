'use client';

// ==========================================
// MARKETING ONBOARDING — TOURS CONFIG + PROVIDER
// File: src/lib/data/marketing/tours.tsx
//
// Defines the NextStep.js tours scoped to the (marketing) route group.
// Mounted exactly once via <MarketingOnboardingProvider> wrapped
// around the marketing layout's children — see
// `src/app/[locale]/(marketing)/layout.tsx`.
//
// Phase 5 polish v4 (May 2026 — non-interactive spotlight):
//
// CHANGED in v4:
//   - showSkip: false (was true in v3). The tour is now an
//     auto-dismissing flash spotlight (~2s) — there's no user
//     interaction model where they'd need a Skip button. Drop it
//     for a cleaner overlay.
//   - showControls: false (unchanged). Single-step tour, no
//     prev/next chrome.
//
// PRESERVED from v3:
//   - Selector: '#builder-category-picker'
//   - Side: 'top'
//   - i18n via useTranslations
//   - Generic NextStepWrapper
//
// SCALABILITY NOTES (for adding tours later):
//
// Adding a new marketing tour:
//   1. Add a unique tour name to MARKETING_TOUR_NAMES
//   2. Add a step config inside useMarketingTours() below
//   3. Add i18n keys under marketing.{your-namespace}
//   4. Trigger from any client component:
//        import { useNextStep } from 'nextstepjs';
//        const { startNextStep } = useNextStep();
//        startNextStep(MARKETING_TOUR_NAMES.YOUR_TOUR);
//
// For the dashboard later: mirror this pattern at
// `src/lib/data/dashboard/tours.tsx` with its own provider component
// mounted in (dashboard)/layout.tsx. Tour bundles stay split per
// route group.
//
// Library: nextstepjs (https://nextstepjs.com)
// ==========================================

import { useMemo, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { NextStepWrapper } from '@/components/shared/onboarding/nextstep-provider';
import type { NextStepTour } from '@/components/shared/onboarding/nextstep-types';

// ==========================================
// TOUR NAMES — keep in sync with startNextStep() callers
// ==========================================

export const MARKETING_TOUR_NAMES = {
  CATEGORY_GATE: 'category-gate',
} as const;

// ==========================================
// PROVIDER
// ==========================================

interface MarketingOnboardingProviderProps {
  children: ReactNode;
}

export function MarketingOnboardingProvider({
  children,
}: MarketingOnboardingProviderProps) {
  const t = useTranslations('marketing.storeBuilder.onboarding');

  const tours = useMemo<NextStepTour[]>(
    () => [
      {
        tour: MARKETING_TOUR_NAMES.CATEGORY_GATE,
        steps: [
          {
            icon: <span aria-hidden>👇</span>,
            title: t('categoryGate.title'),
            content: <span>{t('categoryGate.content')}</span>,
            // Targets the CategoryPicker root in store-builder section
            selector: '#builder-category-picker',
            side: 'top',
            // v4: non-interactive flash spotlight — no controls, no skip
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

  return <NextStepWrapper tours={tours}>{children}</NextStepWrapper>;
}
