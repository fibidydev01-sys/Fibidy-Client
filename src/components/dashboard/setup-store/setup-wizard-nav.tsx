'use client';

// ============================================================================
// SETUP WIZARD NAV — Re-export wrapper
// File: src/components/dashboard/setup-store/setup-wizard-nav.tsx
//
// [MIGRASI — Aug 2026: Re-export dari shared wizard-header]
// Step indicator (mb-8 di body) + nav (floating pill footer) yang dulu dua
// elemen terpisah sekarang digabung jadi satu bar di HEADER (sticky-top).
// Lihat wizard-header.tsx untuk penjelasan lengkap bentuk dan alasannya.
//
// File ini menjadi thin wrapper yang re-export dari shared component —
// pola yang sama persis dengan setup-step-indicator.tsx. Consumer yang
// masih import SetupWizardNav dari path ini tetap berfungsi tanpa perlu
// update import mereka.
//
// PERUBAHAN KONTRAK: SetupWizardNav lama menerima onSubmit (dipetakan ke
// Rocket icon + label submit/submitting sendiri). WizardHeader generik
// menerima itu semua lewat onLastStep + lastStepIcon/lastStepLabel/
// lastStepSavingLabel — jadi wrapper ini yang menjembatani nama lama ke
// nama generik, bukan pemanggilnya (seller-setup-wizard.tsx) yang harus
// tahu detail itu.
//
// Actual implementation ada di:
//   src/components/dashboard/shared/wizard-header.tsx
// ============================================================================

import { Rocket } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { WizardHeader } from '@/components/dashboard/shared/wizard-header';
import type { StepDef } from '@/components/dashboard/shared/step-indicator';

interface SetupWizardNavProps {
  currentStep: number;  // 0-indexed
  totalSteps: number;
  steps: readonly StepDef[];
  onStepClick?: (index: number) => void;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSaving?: boolean;
}

export function SetupWizardNav({
  currentStep,
  steps,
  onStepClick,
  onBack,
  onPrev,
  onNext,
  onSubmit,
  isSaving = false,
}: SetupWizardNavProps) {
  const t = useTranslations('dashboard.setupStore.seller');

  return (
    <WizardHeader
      steps={steps}
      currentStep={currentStep}
      onStepClick={onStepClick}
      onBack={onBack}
      onPrev={onPrev}
      onNext={onNext}
      onLastStep={onSubmit}
      isSaving={isSaving}
      lastStepIcon={Rocket}
      lastStepLabel={t('cta.submit')}
      lastStepSavingLabel={t('cta.submitting')}
    />
  );
}

export type { StepDef } from '@/components/dashboard/shared/step-indicator';
