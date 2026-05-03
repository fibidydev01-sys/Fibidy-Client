'use client';

// ==========================================
// REGISTER NAV
// File: src/components/auth/register/register-nav.tsx
//
// [VERCEL VIBES — May 2026]
// Auth-page–specific wizard navigation. Duplicated and simplified from
// the dashboard's shared `WizardNav`.
//
// What changed vs WizardNav:
//   - INLINE, not fixed-bottom. The original WizardNav uses
//     `position: fixed` + `left: var(--sidebar-width)` to sit above
//     the dashboard sidebar. On the register page there is no sidebar,
//     so `--sidebar-width` is undefined → falls back to 0 → nav misaligns
//     with the centered form. Same story for the mobile `bottom-16`
//     offset (designed for the dashboard tab bar that doesn't exist
//     here). Going inline removes both bugs without sticky workarounds.
//   - SINGLE render path. WizardNav has separate desktop/mobile blocks
//     because of the fixed layout. Inline mode renders once and uses
//     responsive utilities to adapt.
//   - SAVE-ONLY mode dropped. Register only ever uses multi-step.
//
// Same prop names as WizardNav for the props register actually uses,
// so the migration in register.tsx is a 1-line import swap + dropping
// the `onSave` prop (which was unused in multi-step mode anyway).
//
// i18n: default labels (Save/Saving/Back/Previous/Next) resolved from
// `common.actions.*` via useTranslations. Caller can override via props.
// ==========================================

import { ChevronLeft, ChevronRight, Save, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { RegisterStepDots } from './register-step-indicator';
import { cn } from '@/lib/shared/utils';

interface Step {
  title: string;
  desc?: string;
}

interface RegisterNavProps {
  // Step navigation (required — register is always multi-step)
  steps: readonly Step[];
  currentStep: number;
  onPrev: () => void;
  onNext: () => void;
  onLastStep: () => void;

  // Submit state
  isSaving?: boolean;

  // Universal back — when on step 0, caller decides where back goes
  onBack?: () => void;

  // Last step labels (e.g. "Submit" instead of generic "Save")
  lastStepIcon?: LucideIcon;
  lastStepLabel?: string;
  lastStepSavingLabel?: string;
}

export function RegisterNav({
  steps,
  currentStep,
  onPrev,
  onNext,
  onLastStep,
  isSaving = false,
  onBack,
  lastStepIcon,
  lastStepLabel,
  lastStepSavingLabel,
}: RegisterNavProps) {
  const t = useTranslations('common.actions');

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const LastStepIcon = lastStepIcon ?? Save;
  const resolvedLastLabel = lastStepLabel ?? t('save');
  const resolvedLastSavingLabel = lastStepSavingLabel ?? t('saving');

  const handlePrev = () => {
    if (isFirstStep) {
      onBack?.();
    } else {
      onPrev();
    }
  };

  // Hide the prev button on step 0 unless caller provided onBack
  const showPrevButton = !isFirstStep || !!onBack;

  return (
    <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t">
      {/* Prev / Back */}
      <Button
        variant="outline"
        onClick={handlePrev}
        className={cn(
          'gap-1.5 h-9 text-sm sm:min-w-[120px]',
          !showPrevButton && 'invisible',
        )}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          {isFirstStep ? t('back') : t('previous')}
        </span>
      </Button>

      {/* Step dots */}
      <RegisterStepDots steps={steps} currentStep={currentStep} />

      {/* Next / Submit */}
      {isLastStep ? (
        <Button
          onClick={onLastStep}
          disabled={isSaving}
          className="gap-1.5 h-9 text-sm sm:min-w-[120px]"
        >
          <LastStepIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {isSaving ? resolvedLastSavingLabel : resolvedLastLabel}
          </span>
        </Button>
      ) : (
        <Button
          onClick={onNext}
          className="gap-1.5 h-9 text-sm sm:min-w-[120px]"
        >
          <span className="hidden sm:inline">{t('next')}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
