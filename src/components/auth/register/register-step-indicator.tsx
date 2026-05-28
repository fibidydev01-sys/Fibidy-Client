'use client';

// ============================================================================
// REGISTER STEP INDICATOR — Re-export wrapper
// File: src/components/auth/register/register-step-indicator.tsx
//
// [SPRINT 4 — D2 FIX: Re-export dari shared step-indicator]
// File ini sekarang menjadi thin wrapper yang re-export dari shared component.
// Semua consumer yang import dari path ini tetap berfungsi tanpa perlu
// update import mereka.
//
// Actual implementation ada di:
//   src/components/dashboard/shared/step-indicator.tsx
// ============================================================================

export {
  StepIndicator as RegisterStepIndicator,
  StepDots as RegisterStepDots,
} from '@/components/dashboard/shared/step-indicator';

export type { StepDef } from '@/components/dashboard/shared/step-indicator';
