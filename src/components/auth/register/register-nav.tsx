'use client';

// ============================================================================
// REGISTER NAV
// File: src/components/auth/register/register-nav.tsx
//
// [STEP WELCOME — May 2026]
// Tambah prop isWelcomeStep:
//   - true  → kiri "← Kembali" ke backHref ("/"), kanan "Mulai →", dots hidden
//   - false → nav normal (Sebelumnya · dots · Lanjut/Submit)
//
// Step 1 (Intent):
//   - Kiri "← Sebelumnya" → prevStep() → kembali ke Welcome
//
// [UI/UX — Aug 2026] Self-contained pill styling — sticky, rounded-full,
// shadow, backdrop-blur, hidden sm:inline responsive labels — matching
// dashboard/shared/wizard-nav.tsx's pattern instead of leaving shape/
// position up to each caller (previously: register.tsx wrapped this in
// its own sticky+border+no-rounding footer, while setup-store's
// BuyerUpgradeWizard didn't wrap it in anything at all — two different
// looks for the same component). Width is max-w-lg, not the dashboard's
// max-w-2xl: register.tsx's own step content (StepStoreInfo) already
// caps out at max-w-md, and the register PAGE itself is one half of a
// lg:grid-cols-2 split-screen layout — max-w-2xl risks overflowing that
// column at moderate desktop widths. max-w-lg matches the page's own
// outer cap (register/page.tsx's `w-full max-w-lg` form column).
// ============================================================================

import { ChevronLeft, ChevronRight, Save, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
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
  lastStepIcon?: LucideIcon;
  lastStepLabel?: string;
  lastStepSavingLabel?: string;
  /** Destinasi tombol kembali di step pertama / welcome. Default: "/" */
  backHref?: string;
  /**
   * true  = sedang di Welcome (step 0):
   *           kiri → backHref, kanan → "Mulai", dots hidden
   * false = step 1+ normal
   */
  isWelcomeStep?: boolean;
}

export function RegisterNav({
  steps,
  currentStep,
  onPrev,
  onNext,
  onLastStep,
  isSaving = false,
  lastStepIcon,
  lastStepLabel,
  lastStepSavingLabel,
  backHref = '/',
  isWelcomeStep = false,
}: RegisterNavProps) {
  const t = useTranslations('common.actions');
  const tRegister = useTranslations('auth.register');
  const router = useRouter();

  const isLastStep = !isWelcomeStep && currentStep === steps.length - 1;
  // Step 1 (Intent) = currentStep 0 dalam STEPS array → isFirstWizardStep
  const isFirstWizardStep = !isWelcomeStep && currentStep === 0;

  const LastStepIcon = lastStepIcon ?? Save;
  const resolvedLastLabel = lastStepLabel ?? t('save');
  const resolvedLastSavingLabel = lastStepSavingLabel ?? t('saving');

  const handlePrev = () => {
    if (isWelcomeStep || isFirstWizardStep) {
      // Welcome atau Intent → ke "/"
      // (Intent → prevStep() akan balik ke Welcome, Welcome → backHref)
      if (isWelcomeStep) {
        router.push(backHref);
      } else {
        // isFirstWizardStep (Intent) → prevStep() → Welcome
        onPrev();
      }
    } else {
      onPrev();
    }
  };

  // ── WELCOME STEP ──────────────────────────────────────────────────────────
  if (isWelcomeStep) {
    return (
      <div className="sticky bottom-16 md:bottom-4 z-40 mx-auto flex w-full max-w-lg items-center justify-between gap-2 rounded-full border bg-background/90 px-4 sm:px-6 py-3 shadow-lg backdrop-blur-sm">
        {/* Kiri: Kembali ke "/" */}
        <Button
          variant="outline"
          onClick={() => router.push(backHref)}
          className="gap-1.5 h-9 text-sm rounded-full sm:min-w-[120px]"
        >
          <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">{t('back')}</span>
        </Button>

        {/* Tengah: kosong (dots tidak relevan di Welcome) */}
        <div />

        {/* Kanan: Mulai */}
        <Button
          onClick={onNext}
          className="gap-1.5 h-9 text-sm rounded-full sm:min-w-[120px]"
        >
          <span className="hidden sm:inline">{tRegister('welcome.cta')}</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        </Button>
      </div>
    );
  }

  // ── STEP 1+ NORMAL ────────────────────────────────────────────────────────
  return (
    <div className="sticky bottom-16 md:bottom-4 z-40 mx-auto flex w-full max-w-lg items-center justify-between gap-2 rounded-full border bg-background/90 px-4 sm:px-6 py-3 shadow-lg backdrop-blur-sm">

      {/* Kiri: Sebelumnya (atau kembali ke Welcome dari Intent) */}
      <Button
        variant="outline"
        onClick={handlePrev}
        className="gap-1.5 h-9 text-sm rounded-full sm:min-w-[120px]"
      >
        <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">{t('previous')}</span>
      </Button>

      {/* Tengah: dots */}
      <RegisterStepDots steps={steps} currentStep={currentStep} />

      {/* Kanan: Lanjut atau Submit */}
      {isLastStep ? (
        <Button
          onClick={onLastStep}
          disabled={isSaving}
          className="gap-1.5 h-9 text-sm rounded-full sm:min-w-[120px]"
        >
          <LastStepIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">
            {isSaving ? resolvedLastSavingLabel : resolvedLastLabel}
          </span>
        </Button>
      ) : (
        <Button
          onClick={onNext}
          className="gap-1.5 h-9 text-sm rounded-full sm:min-w-[120px]"
        >
          <span className="hidden sm:inline">{t('next')}</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        </Button>
      )}

    </div>
  );
}