'use client';

// ============================================================================
// WIZARD HEADER — step indicator + nav digabung jadi satu bar di atas
// File: src/components/dashboard/shared/wizard-header.tsx
//
// [MIGRASI — Aug 2026] Header (bukan lagi footer) untuk wizard
//
// ── [FINAL — Aug 2026 v5] LEBAR DARI v4 + NEMPEL DARI v3 ─────────────────
//
// v3: breakout `-mt-*` supaya bar nempel ke DashboardTopbar (sticky top-0).
//     Lebar pakai `-mx-*` breakout yang rapuh (harus hitung manual padding
//     DashboardShell + container).
//
// v4: lebar BENAR — adopsi pola WizardNav (`md:w-full mx-auto PAGE_MAX_W`,
//     sticky in-flow). Tapi `top-4` bikin bar tidak nempel ke topbar.
//
// v5 gabungkan keduanya:
//   - Lebar  : `md:w-full mx-auto PAGE_MAX_W` dari v4 — tidak perlu hitung
//              manual, bar mewarisi lebar container induknya.
//   - Nempel : `-mt-4 md:-mt-6 lg:-mt-8` dari v3 — menegasikan padding-top
//              DashboardShell supaya bar menyentuh tepi atas panel.
//   - Posisi : `sticky top-0` — nempel tepat di bawah DashboardTopbar
//              sepanjang scroll.
//
// Tidak ada -mx-* sama sekali — lebar sudah benar dari `md:w-full`.
// ============================================================================

import { ChevronLeft, ChevronRight, Crown, Save, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { StepIndicator, type StepDef } from '@/components/dashboard/shared/step-indicator';
import { cn } from '@/lib/shared/utils';
import { PAGE_MAX_W } from '@/components/dashboard/shared/page-column';

interface WizardHeaderProps {
  /** Opsional — tidak diberikan berarti save-only mode. */
  steps?: readonly StepDef[];
  currentStep?: number;
  onStepClick?: (index: number) => void;

  /** Wajib — slot kiri selalu terisi. */
  onBack: () => void;
  onPrev?: () => void;
  onNext?: () => void;

  onSave?: () => void;
  isSaving?: boolean;
  saveLabel?: string;
  savingLabel?: string;
  hideSaveButton?: boolean;

  lastStepIcon?: LucideIcon;
  lastStepLabel?: string;
  lastStepSavingLabel?: string;
  onLastStep?: () => void;

  saveTerkunci?: boolean;
}

export function WizardHeader({
  steps,
  currentStep = 0,
  onStepClick,
  onBack,
  onPrev,
  onNext,
  onSave,
  isSaving = false,
  saveLabel,
  savingLabel,
  hideSaveButton = false,
  lastStepIcon,
  lastStepLabel,
  lastStepSavingLabel,
  onLastStep,
  saveTerkunci = false,
}: WizardHeaderProps) {
  const t = useTranslations('common.actions');

  const hasSteps = steps !== undefined && steps.length > 0;
  const isFirstStep = currentStep === 0;
  const isLastStep = hasSteps ? currentStep === steps.length - 1 : true;
  const total = hasSteps ? steps.length : 0;

  const resolvedSaveLabel = saveLabel ?? t('save');
  const resolvedSavingLabel = savingLabel ?? t('saving');

  const LastStepIcon = lastStepIcon ?? Save;
  const resolvedLastLabel = lastStepLabel ?? resolvedSaveLabel;
  const resolvedLastSavingLabel = lastStepSavingLabel ?? resolvedSavingLabel;
  const handleLastStep = onLastStep ?? onSave;

  const handleBackOrPrev = () => {
    if (!hasSteps || isFirstStep) {
      onBack();
    } else {
      onPrev?.();
    }
  };

  return (
    <div
      className={cn(
        // NEMPEL (dari v3): menegasikan padding-top DashboardShell
        // supaya bar menyentuh tepi atas panel, persis di bawah DashboardTopbar.
        // Angka terikat ke `p-4 md:p-6 lg:p-8` di dashboard-shell.tsx —
        // kalau padding itu berubah, ketiga angka ini ikut berubah.
        '-mt-4 md:-mt-6 lg:-mt-8',
        // POSISI: sticky top-0 — nempel sepanjang scroll
        'sticky top-0 z-40',
        // LEBAR (dari v4): mewarisi lebar container induk, tidak perlu
        // hitung manual. `md:w-full` wajib — tanpa ini mx-auto menyusut
        // flex-item ke shrink-to-fit (lihat v6 note di wizard-nav.tsx).
        'mx-auto md:w-full',
        PAGE_MAX_W,
        // BENTUK
        'flex items-center justify-between gap-2 sm:gap-4',
        'rounded-full border bg-background/90 px-4 sm:px-6 py-3 shadow-lg backdrop-blur-sm',
      )}
    >
      {/* Kiri — Back atau Prev */}
      <Button
        variant="outline"
        onClick={handleBackOrPrev}
        className="gap-1.5 text-sm rounded-full sm:min-w-[110px]"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          {!hasSteps || isFirstStep ? t('back') : t('previous')}
        </span>
      </Button>

      {/* Tengah — hanya ada kalau steps diberikan */}
      {hasSteps && (
        <div className="flex items-center justify-center">
          <span className="text-xs text-muted-foreground tabular-nums md:hidden">
            {currentStep + 1}/{total}
          </span>
          <div className="hidden md:block">
            <StepIndicator
              steps={steps}
              currentStep={currentStep}
              onStepClick={onStepClick}
              size="sm"
            />
          </div>
        </div>
      )}

      {/* Kanan — Save / Next / Submit */}
      {!hasSteps ? (
        !hideSaveButton && (
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="gap-1.5 text-sm rounded-full sm:min-w-[110px]"
          >
            {saveTerkunci ? (
              <Crown className="h-3.5 w-3.5 text-amber-300" aria-hidden />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {isSaving ? resolvedSavingLabel : resolvedSaveLabel}
            </span>
          </Button>
        )
      ) : isLastStep ? (
        <Button
          onClick={handleLastStep}
          disabled={isSaving}
          className="gap-1.5 text-sm rounded-full sm:min-w-[110px]"
        >
          {saveTerkunci ? (
            <Crown className="h-3.5 w-3.5 text-amber-300" aria-hidden />
          ) : (
            <LastStepIcon className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">
            {isSaving ? resolvedLastSavingLabel : resolvedLastLabel}
          </span>
        </Button>
      ) : (
        <Button
          onClick={onNext}
          className="gap-1.5 text-sm rounded-full sm:min-w-[110px]"
        >
          <span className="hidden sm:inline">{t('next')}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}