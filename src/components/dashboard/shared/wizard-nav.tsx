'use client';

// ==========================================
// WizardNav — Fixed Bottom Navigation
// Handles 3 varian:
//
//   A. Multi-step  → ada steps + Prev/Next/Save
//   B. Save-only   → tidak ada steps, hanya Save button
//   C. Submit      → seperti A tapi last action adalah submit
//
// onBack (universal) → step 0: caller tentukan kemana (back to list,
//                      back to dashboard, back to wherever)
//
// Dipakai di: hero, contact, payment, shipping,
//             social, about, product form, register
// ==========================================

import { ChevronLeft, ChevronRight, Save, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepDots } from '@/components/dashboard/shared/step-wizard';
import { cn } from '@/lib/shared/utils';

interface Step {
  title: string;
  desc?: string;
}

interface WizardNavProps {
  // Save / Submit
  onSave: () => void;
  isSaving?: boolean;
  saveLabel?: string;
  savingLabel?: string;

  // Universal back — step 0: caller tentukan kemana
  onBack?: () => void;

  // Step navigation — optional, jika tidak ada → Save-only mode
  steps?: readonly Step[];
  currentStep?: number;
  onPrev?: () => void;
  onNext?: () => void;

  // Last step override — untuk kasus Review & Publish, Create store, dll
  lastStepIcon?: LucideIcon;
  lastStepLabel?: string;
  lastStepSavingLabel?: string;
  onLastStep?: () => void;   // jika undefined, fallback ke onSave
}

export function WizardNav({
  onSave,
  isSaving = false,
  saveLabel = 'Save',
  savingLabel = 'Saving...',
  onBack,
  steps,
  currentStep = 0,
  onPrev,
  onNext,
  lastStepIcon,
  lastStepLabel,
  lastStepSavingLabel,
  onLastStep,
}: WizardNavProps) {
  const hasSteps = steps !== undefined && steps.length > 0;
  const isLastStep = hasSteps ? currentStep === steps.length - 1 : true;
  const isFirstStep = currentStep === 0;

  const LastStepIcon = lastStepIcon ?? Save;
  const resolvedLastLabel = lastStepLabel ?? saveLabel;
  const resolvedLastSavingLabel = lastStepSavingLabel ?? savingLabel;
  const handleLastStep = onLastStep ?? onSave;

  // Prev button logic:
  // - step 0 + onBack → trigger onBack
  // - step 0 + no onBack → invisible
  // - step 1+ → trigger onPrev
  const handlePrev = () => {
    if (isFirstStep) {
      onBack?.();
    } else {
      onPrev?.();
    }
  };

  const showPrevButton = !isFirstStep || !!onBack;

  // ── Save-only mode (shipping, social, about) ─────────────────────────
  if (!hasSteps) {
    return (
      <>
        {/* Desktop */}
        <div
          className="hidden lg:flex fixed bottom-0 right-0 z-40 items-center justify-between px-8 py-4 bg-background/90 backdrop-blur-sm border-t"
          style={{ left: 'var(--sidebar-width)' }}
        >
          {/* Back button (save-only mode) */}
          {onBack ? (
            <Button
              variant="outline"
              onClick={onBack}
              className="gap-1.5 min-w-[130px] h-9 text-sm"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            onClick={onSave}
            disabled={isSaving}
            className="gap-1.5 h-9 text-sm min-w-[130px]"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? savingLabel : saveLabel}
          </Button>
        </div>

        {/* Mobile */}
        <div className="lg:hidden fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-sm border-t">
          <div className="px-4 py-3 flex items-center justify-between">
            {onBack ? (
              <Button
                variant="outline"
                size="icon"
                onClick={onBack}
                className="h-9 w-9 shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : (
              <div />
            )}
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="h-9 px-4 text-xs font-medium"
            >
              {isSaving ? savingLabel : saveLabel}
            </Button>
          </div>
        </div>
      </>
    );
  }

  // ── Multi-step mode (hero, contact, payment, product, register) ───────
  return (
    <>
      {/* Desktop */}
      <div
        className="hidden lg:flex fixed bottom-0 right-0 z-40 items-center justify-between px-8 py-4 bg-background/90 backdrop-blur-sm border-t"
        style={{ left: 'var(--sidebar-width)' }}
      >
        <Button
          variant="outline"
          onClick={handlePrev}
          className={cn(
            'gap-1.5 min-w-[130px] h-9 text-sm',
            !showPrevButton && 'invisible',
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {isFirstStep ? 'Back' : 'Previous'}
        </Button>

        <StepDots steps={steps} currentStep={currentStep} />

        {isLastStep ? (
          <Button
            onClick={handleLastStep}
            disabled={isSaving}
            className="gap-1.5 min-w-[130px] h-9 text-sm"
          >
            <LastStepIcon className="h-3.5 w-3.5" />
            {isSaving ? resolvedLastSavingLabel : resolvedLastLabel}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="gap-1.5 min-w-[130px] h-9 text-sm"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Mobile */}
      <div className="lg:hidden fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-sm border-t">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            className={cn('h-9 w-9 shrink-0', !showPrevButton && 'invisible')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <StepDots steps={steps} currentStep={currentStep} />

          {isLastStep ? (
            <Button
              size="sm"
              onClick={handleLastStep}
              disabled={isSaving}
              className="h-9 px-4 text-xs font-medium shrink-0"
            >
              {isSaving ? resolvedLastSavingLabel : resolvedLastLabel}
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={onNext}
              className="h-9 w-9 shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}