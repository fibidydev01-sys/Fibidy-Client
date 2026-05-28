'use client';

// ============================================================================
// STEP WIZARD — Re-export wrapper (Settings pages)
// File: src/components/dashboard/shared/step-wizard.tsx
//
// [SPRINT 4 — D2 FIX: Re-export dari shared step-indicator]
// Settings pages (hero.tsx, contact.tsx, dll) masih import dari sini.
// Re-export agar tidak perlu update semua import di settings.
//
// Actual implementation ada di:
//   src/components/dashboard/shared/step-indicator.tsx
// ============================================================================

export {
  StepIndicator,
  StepDots,
  CompositeStepIndicator,
} from '@/components/dashboard/shared/step-indicator';

export type { StepDef } from '@/components/dashboard/shared/step-indicator';
