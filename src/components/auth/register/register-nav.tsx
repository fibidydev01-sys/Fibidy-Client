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
// position up to each caller (dulu register.tsx membungkusnya dengan
// footer sticky+border sendiri, sementara wizard upgrade di setup-store
// tidak membungkusnya sama sekali — dua tampilan berbeda untuk komponen
// yang sama). Width is max-w-lg, not the dashboard's
// max-w-2xl: register.tsx's own step content (StepStoreInfo) already
// caps out at max-w-md, and the register PAGE itself is one half of a
// lg:grid-cols-2 split-screen layout — max-w-2xl risks overflowing that
// column at moderate desktop widths. max-w-lg matches the page's own
// outer cap (register/page.tsx's `w-full max-w-lg` form column).
//
// [UI/UX — Aug 2026 v2] fixed below md, sticky from md up — matching
// shared/wizard-nav.tsx's v4 fix for the same reasoning (see that file's
// header for the full writeup). Horizontal inset on mobile is left-4/
// right-4 up to sm, then left-6/right-6 — matching register/page.tsx's
// own px-4 sm:px-6 (its md:px-10 step doesn't matter here since fixed
// positioning stops applying at md anyway).
//
// [UI/UX — Aug 2026 v3] Dropped `w-full` — see wizard-nav.tsx's v5 note.
// Same over-constrained-width bug (right edge silently ignored on
// `fixed` + left+right+w-full together) applied here too, confirmed by
// the same viewport sweep.
//
// [UI/UX — Aug 2026 v4] Re-added as `md:w-full` — see wizard-nav.tsx's
// v6 note for the full writeup. Dulu ini memperbaiki pemanggil kedua
// (wizard upgrade di setup-store) yang merender nav sebagai anak
// LANGSUNG kolom flex-nya sendiri — jebakan shrink-to-fit lewat
// auto-margin yang didokumentasikan v6. Pemanggil itu sudah dicabut
// bersama produk digital; `md:w-full` dipertahankan karena memang no-op
// untuk register.tsx (footer-nya sendiri sudah aman) dan menjaga
// komponen ini tetap benar kalau dipakai ulang di kolom flex lain.
// ============================================================================

import { ChevronLeft, ChevronRight, Save, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { RegisterStepDots } from './register-step-indicator';
import { useRouter } from '@/i18n/navigation';

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
      <div className="fixed md:sticky bottom-20 md:bottom-4 left-4 right-4 sm:left-6 sm:right-6 md:left-auto md:right-auto md:w-full z-40 mx-auto flex max-w-lg items-center justify-between gap-2 rounded-full border bg-background/90 px-4 sm:px-6 py-3 shadow-lg backdrop-blur-sm">
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
    <div className="fixed md:sticky bottom-20 md:bottom-4 left-4 right-4 sm:left-6 sm:right-6 md:left-auto md:right-auto md:w-full z-40 mx-auto flex max-w-lg items-center justify-between gap-2 rounded-full border bg-background/90 px-4 sm:px-6 py-3 shadow-lg backdrop-blur-sm">

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