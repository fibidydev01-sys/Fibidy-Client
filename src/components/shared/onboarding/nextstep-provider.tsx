'use client';

// ==========================================
// NEXTSTEP WRAPPER (SHARED — REUSABLE)
// File: src/components/shared/onboarding/nextstep-provider.tsx
//
// Generic wrapper around NextStep.js's NextStepProvider + NextStep
// components. Designed to be mounted PER ROUTE GROUP, not globally:
//
//   - (marketing)/layout.tsx → wrap with marketing tours
//   - (dashboard)/layout.tsx → wrap with dashboard tours (later)
//
// This pattern keeps tour bundles split per route group:
//   - Marketing user does NOT load dashboard tour bundle
//   - Dashboard user does NOT load marketing tour bundle
//
// API:
//   <NextStepWrapper tours={...}>{children}</NextStepWrapper>
//
// `tours` is the steps array NextStep expects — see
// nextstepjs docs for shape: https://nextstepjs.com/docs/nextjs/tour-steps
//
// Why client component: NextStep's hooks (useNextStep) require
// React Context, which only works on the client side.
//
// Library: nextstepjs v2+ (https://nextstepjs.com)
//   pnpm add nextstepjs motion
// ==========================================

import type { ReactNode } from 'react';
import { NextStepProvider, NextStep } from 'nextstepjs';
import type { NextStepTour } from './nextstep-types';

interface NextStepWrapperProps {
  /**
   * Tour configuration array. Each tour has a unique `tour` name and
   * an array of `steps`. See `./nextstep-types.ts` for the full shape.
   */
  tours: NextStepTour[];
  children: ReactNode;
}

export function NextStepWrapper({ tours, children }: NextStepWrapperProps) {
  return (
    <NextStepProvider>
      {/*
        NextStep accepts `steps` as the tours array. Type cast is
        defensive — nextstepjs's exported types use slightly looser
        ReactNode unions than ours. Functionally equivalent.
      */}
      <NextStep steps={tours as never}>{children}</NextStep>
    </NextStepProvider>
  );
}
