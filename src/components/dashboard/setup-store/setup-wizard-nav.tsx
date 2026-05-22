'use client';

// ============================================================================
// SETUP WIZARD NAV
// File: src/components/dashboard/setup-store/setup-wizard-nav.tsx
//
// [PHASE C v2 — May 2026]
// REMOVED: nextDisabled prop — button tidak pernah disabled/silent.
// Next dan Submit selalu enabled.
// Klik dengan kondisi invalid → parent buka ValidationDialog.
// ============================================================================

import { ChevronLeft, ChevronRight, Rocket } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';

interface SetupWizardNavProps {
  currentStep: number;  // 0-indexed
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSaving?: boolean;
}

export function SetupWizardNav({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
  isSaving = false,
}: SetupWizardNavProps) {
  const t = useTranslations('dashboard.setupStore.seller');
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

        {/* Prev */}
        <Button
          variant="outline"
          onClick={onPrev}
          className={cn('gap-1.5', isFirstStep && 'invisible')}
          disabled={isFirstStep}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>

        {/* Step counter */}
        <p className="text-xs text-muted-foreground tabular-nums">
          {currentStep + 1} / {totalSteps}
        </p>

        {/* Next / Submit — ALWAYS ENABLED */}
        {isLastStep ? (
          <Button
            onClick={onSubmit}
            disabled={isSaving}
            className="gap-1.5"
          >
            <Rocket className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isSaving ? t('cta.submitting') : t('cta.submit')}
            </span>
          </Button>
        ) : (
          <Button onClick={onNext} className="gap-1.5">
            <span className="hidden sm:inline">Selanjutnya</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

      </div>
    </div>
  );
}
