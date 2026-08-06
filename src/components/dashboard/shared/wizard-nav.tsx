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
//
// i18n: Default labels (Save/Saving/Back/Previous/Next) di-resolve dari
//       common.actions.* via useTranslations. Caller bisa override via
//       props (saveLabel, savingLabel, lastStepLabel, dst).
//
// [UI/UX — Aug 2026] Desktop bar width is HARDCODED max-w-2xl, on purpose,
// not a per-caller prop. Every caller's own content column can be whatever
// width it wants — this bar deliberately does not follow it. The one time
// it did (a contentMaxWidthClassName override for settings/hero.tsx's
// narrower max-w-lg steps), the result was every page having a
// visibly different bar width, which read as broken rather than adaptive.
// One width, everywhere, no exceptions.
//
// [UI/UX — Aug 2026 v2] Desktop bar switched from `fixed` (positioned
// against the viewport, with `left: var(--sidebar-width)` hand-approximating
// where the content column starts) to `sticky` (positioned as a normal
// child of whatever wraps it). `fixed` required guessing the page shell's
// padding (DashboardShell wraps every page in `container p-4 md:p-6
// lg:p-8`, and `container` itself adds `padding-inline: 2rem` — see
// globals.css) to center correctly; a wrong guess is exactly what made the
// bar visibly off-axis from the content column above it (not parallel —
// each edge shifted by a different, unmatched amount). `sticky` sidesteps
// the guessing entirely: rendered as the last child inside the SAME
// `max-w-2xl mx-auto` column every caller already wraps its own content
// in, it inherits that column's exact box, so it cannot drift from it.
// ==========================================

import { ChevronLeft, ChevronRight, Save, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { StepDots } from '@/components/dashboard/shared/step-wizard';
import { cn } from '@/lib/shared/utils';

interface Step {
  title: string;
  desc?: string;
}

interface WizardNavProps {
  // Save / Submit
  onSave?: () => void;
  isSaving?: boolean;
  saveLabel?: string;
  savingLabel?: string;
  // Back-only bar — instant-apply sections (e.g. Language) with nothing to save
  hideSaveButton?: boolean;

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
  saveLabel,
  savingLabel,
  hideSaveButton = false,
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
  const t = useTranslations('common.actions');

  // i18n defaults — caller can still override via props
  const resolvedSaveLabel = saveLabel ?? t('save');
  const resolvedSavingLabel = savingLabel ?? t('saving');

  const hasSteps = steps !== undefined && steps.length > 0;
  const isLastStep = hasSteps ? currentStep === steps.length - 1 : true;
  const isFirstStep = currentStep === 0;

  const LastStepIcon = lastStepIcon ?? Save;
  const resolvedLastLabel = lastStepLabel ?? resolvedSaveLabel;
  const resolvedLastSavingLabel = lastStepSavingLabel ?? resolvedSavingLabel;
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
        {/* Desktop — floating pill, sticky within (and therefore always
            exactly as wide + as centered as) the max-w-2xl column every
            caller wraps its own content in. See file header. */}
        <div className="hidden lg:flex sticky bottom-4 z-40 mx-auto w-full max-w-2xl items-center justify-between gap-4 rounded-full border bg-background/90 px-6 py-3 shadow-lg backdrop-blur-sm">
          {/* Back button (save-only mode) */}
          {onBack ? (
            <Button
              variant="outline"
              onClick={onBack}
              className="gap-1.5 min-w-[130px] h-9 text-sm rounded-full"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {t('back')}
            </Button>
          ) : (
            <div />
          )}

          {!hideSaveButton && (
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="gap-1.5 h-9 text-sm min-w-[130px] rounded-full"
            >
              <Save className="h-3.5 w-3.5" />
              {isSaving ? resolvedSavingLabel : resolvedSaveLabel}
            </Button>
          )}
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
            {!hideSaveButton && (
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="h-9 px-4 text-xs font-medium"
              >
                {isSaving ? resolvedSavingLabel : resolvedSaveLabel}
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── Multi-step mode (hero, contact, payment, product, register) ───────
  return (
    <>
      {/* Desktop — floating pill, sticky within (and therefore always
          exactly as wide + as centered as) the max-w-2xl column every
          caller wraps its own content in. See file header. */}
      <div className="hidden lg:flex sticky bottom-4 z-40 mx-auto w-full max-w-2xl items-center justify-between gap-4 rounded-full border bg-background/90 px-6 py-3 shadow-lg backdrop-blur-sm">
        <Button
          variant="outline"
          onClick={handlePrev}
          className={cn(
            'gap-1.5 min-w-[130px] h-9 text-sm rounded-full',
            !showPrevButton && 'invisible',
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {isFirstStep ? t('back') : t('previous')}
        </Button>

        <StepDots steps={steps} currentStep={currentStep} />

        {isLastStep ? (
          <Button
            onClick={handleLastStep}
            disabled={isSaving}
            className="gap-1.5 min-w-[130px] h-9 text-sm rounded-full"
          >
            <LastStepIcon className="h-3.5 w-3.5" />
            {isSaving ? resolvedLastSavingLabel : resolvedLastLabel}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="gap-1.5 min-w-[130px] h-9 text-sm rounded-full"
          >
            {t('next')}
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
