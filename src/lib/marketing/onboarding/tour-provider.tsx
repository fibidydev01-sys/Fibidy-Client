'use client';

// ==========================================
// MARKETING TOUR PROVIDER
// File: src/lib/marketing/onboarding/tour-provider.tsx
//
// Phase 9 (May 2026 — onboarding co-location):
//
// Marketing-specific provider that wraps the generic NextStepWrapper
// with the marketing tour config pre-loaded. Mounted exactly once at
// the (marketing) route group layout — see
// `src/app/[locale]/(marketing)/layout.tsx`.
//
// WHY A WRAPPER:
//   The generic `NextStepWrapper` at components/shared/onboarding is
//   route-group-agnostic — it just renders <NextStepProvider> +
//   <NextStep>. This file is the marketing-specific consumer: it
//   pulls marketing tours via useMarketingTours() and hands them
//   off to the wrapper.
//
//   The (dashboard) route group will eventually mount its own
//   parallel `DashboardTourProvider` with its own tours. Both
//   compose the SAME generic NextStepWrapper — bundle splits per
//   route group, no cross-pollination.
//
// MIGRATED FROM:
//   src/lib/data/marketing/tours.tsx (now deleted) — was named
//   `MarketingOnboardingProvider`. Renamed to MarketingTourProvider
//   for symmetry with `tour-config.tsx` / `tour-names.ts`.
//
// CONSUMER:
//   - app/[locale]/(marketing)/layout.tsx — wraps marketing chrome
//     so any client component within can call useNextStep() to
//     trigger a marketing tour
//
// SCALABILITY:
//   Adding a new marketing tour is now 3 trivial steps:
//     1. Add identifier to MARKETING_TOURS in tour-names.ts
//     2. Add step config to useMarketingTours() in tour-config.tsx
//     3. Add i18n keys under marketing.<your-namespace>.onboarding
//   No file additions, no provider wiring change.
// ==========================================

import type { ReactNode } from 'react';
import { NextStepWrapper } from '@/components/shared/onboarding/nextstep-provider';
import { useMarketingTours } from './tour-config';

interface MarketingTourProviderProps {
  children: ReactNode;
}

export function MarketingTourProvider({
  children,
}: MarketingTourProviderProps) {
  const tours = useMarketingTours();

  return <NextStepWrapper tours={tours}>{children}</NextStepWrapper>;
}
