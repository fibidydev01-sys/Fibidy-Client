'use client';

// ==========================================
// REGISTER FORM
// File: src/components/auth/register/register.tsx
//
// [VERCEL VIBES — May 2026]
// Two visible bug fixes via component duplication:
//
// 1. STEP INDICATOR (header)
//    Was: shared <StepIndicator> from dashboard
//    Now: <RegisterStepIndicator> in this folder
//    Same API, fixes nothing visually by itself — but unblocks future
//    auth-only iterations without touching dashboard wizards.
//
// 2. WIZARD NAV (footer)
//    Was: shared <WizardNav>, fixed-bottom with `left: var(--sidebar-width)`
//         and `bottom-16` mobile offset. On the auth page neither
//         CSS variable nor tab-bar exists → nav was misaligned with
//         the centered form on desktop and floated 64px above the
//         viewport bottom on mobile.
//    Now: <RegisterNav>, inline (no `position: fixed`), no sidebar
//         offset, no tab-bar offset. Nav scrolls with the form content.
//         Single render path for desktop + mobile via responsive
//         utilities.
//
// Side effects of the inline nav:
//    - Dropped `pb-24` from the mobile container (was reserving space
//      for the fixed footer; not needed anymore).
//    - Dropped `pb-20` and `lg:h-full lg:flex-col` from the desktop
//      container (same reason).
//    - Step content now renders ONCE outside the responsive header
//      blocks (was rendered twice — once in the lg block, once in the
//      mobile block). The headers stay responsive; the body is shared.
//    - The "Already have a store?" sign-in link is now rendered ONCE
//      below the nav (was duplicated for desktop and mobile).
//
// Everything else (validation, submit handler, welcome screen,
// agreement state, error alert) is unchanged.
// ==========================================

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRegisterWizard } from '@/hooks/auth/use-register-wizard';
import { useRegister } from '@/hooks/auth/use-auth';
import { StepCategory } from './step-category';
import { StepStoreInfo } from './step-store-info';
import { StepAccount } from './step-account';
import { StepReview } from './step-review';
import { StepWelcome } from './step-welcome';
import { RegisterStepIndicator } from './register-step-indicator';
import { RegisterNav } from './register-nav';
import { toast } from 'sonner';

function isPasswordStrong(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export function RegisterForm() {
  const t = useTranslations('auth.register');
  const wizard = useRegisterWizard();
  const { register, isLoading, error } = useRegister();
  const [isAgreed, setIsAgreed] = useState(false);

  const STEPS = [
    { title: t('stepsMeta.businessType.title'), desc: t('stepsMeta.businessType.desc') },
    { title: t('stepsMeta.storeDetails.title'), desc: t('stepsMeta.storeDetails.desc') },
    { title: t('stepsMeta.yourAccount.title'), desc: t('stepsMeta.yourAccount.desc') },
    { title: t('stepsMeta.review.title'), desc: t('stepsMeta.review.desc') },
  ] as const;

  const isWelcome = wizard.state.currentStep === 1;
  const indicatorStep = wizard.state.currentStep - 2;

  const validateCurrentStep = (): boolean => {
    switch (wizard.state.currentStep) {
      case 2:
        if (!wizard.state.category) {
          toast.error(t('errors.categoryRequired'));
          return false;
        }
        return true;
      case 3:
        if (!wizard.state.name?.trim()) {
          toast.error(t('errors.nameRequired'));
          return false;
        }
        if (!wizard.state.slug?.trim()) {
          toast.error(t('errors.slugRequired'));
          return false;
        }
        return true;
      case 4:
        if (!wizard.state.email?.trim()) {
          toast.error(t('errors.emailRequired'));
          return false;
        }
        if (!wizard.state.password) {
          toast.error(t('errors.passwordRequired'));
          return false;
        }
        if (!isPasswordStrong(wizard.state.password)) {
          toast.error(t('errors.passwordWeak'));
          return false;
        }
        if (!wizard.state.whatsapp || wizard.state.whatsapp === '62') {
          toast.error(t('errors.whatsappRequired'));
          return false;
        }
        return true;
      case 5:
        if (!isAgreed) {
          toast.error(t('errors.agreementRequired'));
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    wizard.nextStep();
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    try {
      await register({
        name: wizard.state.name!,
        slug: wizard.state.slug!,
        category: wizard.state.category!,
        description: wizard.state.description || '',
        email: wizard.state.email!,
        password: wizard.state.password!,
        whatsapp: wizard.state.whatsapp!,
      });
    } catch {
      // Error handled in hook
    }
  };

  // ── WELCOME SCREEN ────────────────────────────────────────────────────
  if (isWelcome) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <StepWelcome onNext={wizard.nextStep} />
        <p className="text-center text-sm text-muted-foreground mt-6">
          {t('alreadyHaveStore')}{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            {t('signInLink')}
          </Link>
        </p>
      </div>
    );
  }

  // ── STEP CONTENT ──────────────────────────────────────────────────────
  // Rendered ONCE outside the responsive header blocks (was duplicated
  // pre-VV refactor).
  const stepContent = (
    <>
      {wizard.state.currentStep === 2 && (
        <StepCategory
          selectedCategory={wizard.state.category || ''}
          onSelectCategory={(category) => wizard.updateState({ category })}
        />
      )}
      {wizard.state.currentStep === 3 && (
        <StepStoreInfo
          name={wizard.state.name || ''}
          slug={wizard.state.slug || ''}
          description={wizard.state.description || ''}
          onUpdate={wizard.updateState}
        />
      )}
      {wizard.state.currentStep === 4 && (
        <StepAccount
          email={wizard.state.email || ''}
          password={wizard.state.password || ''}
          whatsapp={wizard.state.whatsapp || ''}
          onUpdate={wizard.updateState}
        />
      )}
      {wizard.state.currentStep === 5 && (
        <StepReview
          data={wizard.state}
          onEdit={(step) => wizard.goToStep(step)}
          onAgreementChange={setIsAgreed}
        />
      )}
    </>
  );

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ══════════ DESKTOP HEADER ══════════ */}
      <div className="hidden lg:block">
        <div className="flex items-start justify-between gap-8 pb-6 border-b mb-8">
          <div className="space-y-1">
            <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
              {t('stepCounter', { current: wizard.state.currentStep - 1, total: STEPS.length })}
            </p>
            <h2 className="text-2xl font-bold tracking-tight leading-none">
              {STEPS[indicatorStep]?.title}
            </h2>
            <p className="text-sm text-muted-foreground pt-0.5">
              {STEPS[indicatorStep]?.desc}
            </p>
          </div>
          <div className="shrink-0 pt-0.5">
            <RegisterStepIndicator
              steps={STEPS}
              currentStep={indicatorStep}
              onStepClick={(i) => wizard.goToStep(i + 2)}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* ══════════ MOBILE HEADER ══════════ */}
      <div className="lg:hidden mb-6">
        <div className="flex justify-center mb-4">
          <RegisterStepIndicator
            steps={STEPS}
            currentStep={indicatorStep}
            onStepClick={(i) => wizard.goToStep(i + 2)}
            size="sm"
          />
        </div>
        <div className="text-center space-y-0.5">
          <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('stepCounter', { current: wizard.state.currentStep - 1, total: STEPS.length })}
          </p>
          <h3 className="text-base font-bold tracking-tight">
            {STEPS[indicatorStep]?.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {STEPS[indicatorStep]?.desc}
          </p>
        </div>
      </div>

      {/* ══════════ STEP CONTENT (shared) ══════════ */}
      <div className="min-h-[300px]">
        {stepContent}
      </div>

      {/* ══════════ INLINE NAV (replaces fixed WizardNav) ══════════ */}
      <RegisterNav
        steps={STEPS}
        currentStep={indicatorStep}
        onPrev={wizard.prevStep}
        onNext={handleNext}
        onLastStep={handleSubmit}
        isSaving={isLoading}
        lastStepLabel={t('review.submitButton')}
        lastStepSavingLabel={t('review.submittingButton')}
      />

      {/* ══════════ SIGN-IN LINK ══════════ */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        {t('alreadyHaveStore')}{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          {t('signInLink')}
        </Link>
      </p>
    </div>
  );
}
