'use client';

// ============================================================================
// SETUP STEP INDICATOR — Re-export wrapper
// File: src/components/dashboard/setup-store/setup-step-indicator.tsx
//
// [SPRINT 4 — D2 FIX: Re-export dari shared step-indicator]
// File ini menjadi thin wrapper yang re-export CompositeStepIndicator
// dari shared component dengan nama SetupStepIndicator.
// Consumer tidak perlu update import mereka.
//
// Actual implementation ada di:
//   src/components/dashboard/shared/step-indicator.tsx
// ============================================================================

export {
  CompositeStepIndicator as SetupStepIndicator,
} from '@/components/dashboard/shared/step-indicator';

export type { StepDef } from '@/components/dashboard/shared/step-indicator';
