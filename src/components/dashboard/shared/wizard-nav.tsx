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
//
// [UI/UX — Aug 2026 v3] Collapsed to ONE bar for every breakpoint — no
// more separate mobile block with its own (unrounded, edge-to-edge) shape.
// The only thing that changes by screen size is button LABEL TEXT
// (`hidden sm:inline`, same pattern setup-wizard-nav.tsx already used) —
// icon-only below `sm`, icon+label from `sm` up. Shape, width, and
// position are identical at every size.
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
      <div className="sticky bottom-16 md:bottom-4 z-40 mx-auto flex w-full max-w-2xl items-center justify-between gap-4 rounded-full border bg-background/90 px-4 sm:px-6 py-3 shadow-lg backdrop-blur-sm">
        {/* Back button (save-only mode) */}
        {onBack ? (
          <Button
            variant="outline"
            onClick={onBack}
            className="gap-1.5 h-9 text-sm rounded-full sm:min-w-[130px]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('back')}</span>
          </Button>
        ) : (
          <div />
        )}

        {!hideSaveButton && (
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="gap-1.5 h-9 text-sm rounded-full sm:min-w-[130px]"
          >
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {isSaving ? resolvedSavingLabel : resolvedSaveLabel}
            </span>
          </Button>
        )}
      </div>
    );
  }

  // ── Multi-step mode (hero, contact, payment, product, register) ───────
  return (
    <div className="sticky bottom-16 md:bottom-4 z-40 mx-auto flex w-full max-w-2xl items-center justify-between gap-2 sm:gap-4 rounded-full border bg-background/90 px-4 sm:px-6 py-3 shadow-lg backdrop-blur-sm">
      <Button
        variant="outline"
        onClick={handlePrev}
        className={cn(
          'gap-1.5 h-9 text-sm rounded-full sm:min-w-[130px]',
          !showPrevButton && 'invisible',
        )}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{isFirstStep ? t('back') : t('previous')}</span>
      </Button>

      <StepDots steps={steps} currentStep={currentStep} />

      {isLastStep ? (
        <Button
          onClick={handleLastStep}
          disabled={isSaving}
          className="gap-1.5 h-9 text-sm rounded-full sm:min-w-[130px]"
        >
          <LastStepIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {isSaving ? resolvedLastSavingLabel : resolvedLastLabel}
          </span>
        </Button>
      ) : (
        <Button
          onClick={onNext}
          className="gap-1.5 h-9 text-sm rounded-full sm:min-w-[130px]"
        >
          <span className="hidden sm:inline">{t('next')}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
