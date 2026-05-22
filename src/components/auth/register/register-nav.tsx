'use client';

// ============================================================================
// REGISTER NAV
// File: src/components/auth/register/register-nav.tsx
//
// [PHASE C v2 — May 2026]
// REMOVED: nextDisabled prop — button tidak pernah disabled/silent lagi.
// Next dan Submit selalu enabled. Klik dengan kondisi invalid → parent
// membuka ValidationDialog yang menjelaskan field mana yang kurang.
//
// Filosofi: button disabled yang silent = user bingung kenapa tidak bisa lanjut.
// Hard dialog = user tahu persis apa yang harus diperbaiki.
// ============================================================================

import { ChevronLeft, ChevronRight, Save, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { RegisterStepDots } from './register-step-indicator';

interface Step {
  title: string;
  desc?: string;
}

interface RegisterNavProps {
  steps: readonly Step[];
  currentStep: number;
  onPrev: () => void;
  onNext: () => void;
  onLastStep: () => void;
  isSaving?: boolean;
  onBack?: () => void;
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

  const showPrevButton = !isFirstStep || !!onBack;

  return (
    <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t">
      {/* Prev / Back */}
      <Button
        variant="outline"
        onClick={handlePrev}
        className={`gap-1.5 h-9 text-sm sm:min-w-[120px] ${!showPrevButton ? 'invisible' : ''}`}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          {isFirstStep ? t('back') : t('previous')}
        </span>
      </Button>

      {/* Step dots */}
      <RegisterStepDots steps={steps} currentStep={currentStep} />

      {/* Next / Submit — ALWAYS ENABLED, validation via dialog */}
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
