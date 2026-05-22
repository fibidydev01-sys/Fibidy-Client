'use client';

// ============================================================================
// REGISTER FORM
// File: src/components/auth/register/register.tsx
//
// [PHASE D — May 2026]
// - StepWelcome DIHAPUS, digantikan StepIntent (step 1)
// - Dynamic step list per intent (BUYER: 3 steps, SELLER/EDU: 5 steps)
// - handleSubmit routing: BUYER → registerBuyer(), SELLER/EDU → register()
// - Step indicator menyesuaikan step count per intent
//
// [PHASE C v2 — May 2026]
// - Next/Submit SELALU ENABLED — validasi via ValidationDialog
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { ValidationDialog } from '@/components/ui/validation-dialog';
import { useRegisterWizard, getTotalSteps, getAccountStep, getReviewStep } from '@/hooks/auth/use-register-wizard';
import { useRegister, useCheckSlug } from '@/hooks/auth/use-auth';
import { useDebounce } from '@/hooks/shared/use-debounce';
import { generateSlugSuggestions } from '@/lib/utils/slug-suggestions';
import { validateSlugFormat } from '@/lib/constants/shared/slug.constants';
import { StepIntent } from './step-intent';
import { StepCategory } from './step-category';
import { StepStoreInfo } from './step-store-info';
import { StepAccount } from './step-account';
import { StepReview } from './step-review';
import { RegisterStepIndicator } from './register-step-indicator';
import { RegisterNav } from './register-nav';
import type { RegisterIntent } from '@/types/auth';

// ============================================================
// VALIDATION HELPERS
// ============================================================

function isPasswordStrong(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPhoneValid(whatsapp: string): boolean {
  const digits = whatsapp.replace(/\D/g, '');
  return digits.length >= 7;
}

// ============================================================
// STEP DEFINITIONS PER INTENT
// ============================================================

function getStepDefs(
  intent: RegisterIntent | null,
  t: ReturnType<typeof useTranslations>,
) {
  if (intent === 'BUYER') {
    return [
      { title: t('stepsMeta.whoAreYou.title'), desc: t('stepsMeta.whoAreYou.desc') },
      { title: t('stepsMeta.yourAccount.title'), desc: t('stepsMeta.yourAccount.desc') },
      { title: t('stepsMeta.review.title'), desc: t('stepsMeta.review.desc') },
    ];
  }
  // SELLER / EDU / null (null = intent not yet selected, show full)
  return [
    { title: t('stepsMeta.whoAreYou.title'), desc: t('stepsMeta.whoAreYou.desc') },
    { title: t('stepsMeta.businessType.title'), desc: t('stepsMeta.businessType.desc') },
    { title: t('stepsMeta.storeDetails.title'), desc: t('stepsMeta.storeDetails.desc') },
    { title: t('stepsMeta.yourAccount.title'), desc: t('stepsMeta.yourAccount.desc') },
    { title: t('stepsMeta.review.title'), desc: t('stepsMeta.review.desc') },
  ];
}

// ============================================================
// COMPONENT
// ============================================================

export function RegisterForm() {
  const t = useTranslations('auth.register');
  const wizard = useRegisterWizard();
  const { register, registerBuyer, isLoading, error, errorCode, reset: resetRegister } = useRegister();
  const { checkSlug, isChecking, isAvailable, reset: resetSlug } = useCheckSlug();

  const [isAgreed, setIsAgreed] = useState(true);
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);
  const [slugConflictOpen, setSlugConflictOpen] = useState(false);
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);

  const debouncedSlug = useDebounce(wizard.state.slug || '', 500);

  useEffect(() => {
    if (debouncedSlug && debouncedSlug.length >= 3) {
      checkSlug(debouncedSlug);
    } else {
      resetSlug();
    }
  }, [debouncedSlug, checkSlug, resetSlug]);

  useEffect(() => {
    if (wizard.cameFromBuilder) setIsAgreed(true);
  }, [wizard.cameFromBuilder]);

  useEffect(() => {
    if (!errorCode) return;
    if (errorCode === 'SLUG_TAKEN_AFTER_PREVIEW') {
      const suggestions = wizard.state.slug ? generateSlugSuggestions(wizard.state.slug) : [];
      setSlugSuggestions(suggestions);
      setSlugConflictOpen(true);
    } else if (errorCode === 'EMAIL_TAKEN_AFTER_PREVIEW') {
      wizard.goToStep(getAccountStep(wizard.state.intent));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorCode]);

  const intent = wizard.state.intent;
  const STEPS = useMemo(() => getStepDefs(intent, t), [intent, t]);

  // currentStep is 1-based; indicator is 0-based
  const indicatorStep = wizard.state.currentStep - 1;

  // ── Validation errors per step ──────────────────────────────────────────

  const getStepErrors = useMemo(() => {
    return (step: number): string[] => {
      const s = wizard.state;
      const errors: string[] = [];

      switch (step) {
        case 1: // Intent step
          if (!s.intent) errors.push(t('errors.intentRequired'));
          break;
        case 2:
          if (intent === 'BUYER') {
            // Account step for buyer
            if (!s.email || !isEmailValid(s.email)) errors.push(t('errors.emailInvalid'));
            if (!s.password || !isPasswordStrong(s.password)) errors.push(t('errors.passwordWeak'));
          } else {
            // Category step for seller/edu
            if (!s.category?.trim()) errors.push(t('errors.categoryRequired'));
          }
          break;
        case 3:
          if (intent === 'BUYER') {
            // Review step for buyer
            if (!isAgreed) errors.push(t('errors.agreementRequired'));
          } else {
            // StoreInfo step for seller/edu
            if (!s.name || s.name.trim().length < 3) errors.push(t('errors.nameRequired'));
            if (!s.slug || s.slug.length < 3 || !validateSlugFormat(s.slug).valid)
              errors.push(t('errors.slugRequired'));
            if (isChecking) errors.push(t('errors.slugChecking'));
            if (isAvailable === false) errors.push(t('errors.slugTaken'));
          }
          break;
        case 4:
          // Account step for seller/edu
          if (!s.email || !isEmailValid(s.email)) errors.push(t('errors.emailInvalid'));
          if (!s.password || !isPasswordStrong(s.password)) errors.push(t('errors.passwordWeak'));
          if (!s.whatsapp || !isPhoneValid(s.whatsapp)) errors.push(t('errors.whatsappRequired'));
          break;
        case 5:
          // Review step for seller/edu
          if (!isAgreed) errors.push(t('errors.agreementRequired'));
          break;
      }
      return errors;
    };
  }, [wizard.state, intent, isChecking, isAvailable, isAgreed, t]);

  // ── Navigation ──────────────────────────────────────────────────────────

  const handleNext = () => {
    const errors = getStepErrors(wizard.state.currentStep);
    if (errors.length > 0) {
      setValidationItems(errors);
      setValidationOpen(true);
      return;
    }
    wizard.nextStep();
  };

  const handleSubmit = async () => {
    const errors = getStepErrors(wizard.state.currentStep);
    if (errors.length > 0) {
      setValidationItems(errors);
      setValidationOpen(true);
      return;
    }

    try {
      if (intent === 'BUYER') {
        await registerBuyer({
          email: wizard.state.email!,
          password: wizard.state.password!,
        });
      } else {
        await register({
          intent: intent as 'SELLER' | 'EDU',
          name: wizard.state.name!,
          slug: wizard.state.slug!,
          category: wizard.state.category!,
          description: wizard.state.description || '',
          email: wizard.state.email!,
          password: wizard.state.password!,
          whatsapp: wizard.state.whatsapp!,
          agreementAccepted: true,
        });
      }
    } catch {
      // Error handled in hook + via errorCode effect
    }
  };

  const handlePickSuggestion = (suggestion: string) => {
    wizard.updateState({ slug: suggestion });
    setSlugConflictOpen(false);
    setSlugSuggestions([]);
    resetRegister();
  };

  // ── Step content rendering ──────────────────────────────────────────────

  const renderStep = () => {
    const { currentStep } = wizard.state;

    // Step 1 = Intent (always)
    if (currentStep === 1) {
      return (
        <StepIntent
          selected={wizard.state.intent}
          onSelect={(selectedIntent) => {
            wizard.selectIntent(selectedIntent);
          }}
        />
      );
    }

    // BUYER flow
    if (intent === 'BUYER') {
      if (currentStep === 2) {
        return (
          <StepAccount
            email={wizard.state.email || ''}
            password={wizard.state.password || ''}
            whatsapp=""
            hiddenFields={['whatsapp']}
            onUpdate={wizard.updateState}
          />
        );
      }
      if (currentStep === 3) {
        return (
          <StepReview
            data={wizard.state}
            intent={intent}
            onEdit={(step) => wizard.goToStep(step)}
            isAgreed={isAgreed}
            onAgreementChange={setIsAgreed}
            cameFromBuilder={wizard.cameFromBuilder}
          />
        );
      }
    }

    // SELLER / EDU flow
    if (currentStep === 2) {
      return (
        <StepCategory
          selectedCategory={wizard.state.category || ''}
          onSelectCategory={(category) => wizard.updateState({ category })}
        />
      );
    }
    if (currentStep === 3) {
      return (
        <StepStoreInfo
          name={wizard.state.name || ''}
          slug={wizard.state.slug || ''}
          description={wizard.state.description || ''}
          onUpdate={wizard.updateState}
          isChecking={isChecking}
          isAvailable={isAvailable}
        />
      );
    }
    if (currentStep === 4) {
      return (
        <StepAccount
          email={wizard.state.email || ''}
          password={wizard.state.password || ''}
          whatsapp={wizard.state.whatsapp || ''}
          onUpdate={wizard.updateState}
        />
      );
    }
    if (currentStep === 5) {
      return (
        <StepReview
          data={wizard.state}
          intent={intent}
          onEdit={(step) => wizard.goToStep(step)}
          isAgreed={isAgreed}
          onAgreementChange={setIsAgreed}
          cameFromBuilder={wizard.cameFromBuilder}
        />
      );
    }

    return null;
  };

  const isLastStep = wizard.isLastStep;
  const totalSteps = getTotalSteps(intent);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col">
      {error && errorCode !== 'SLUG_TAKEN_AFTER_PREVIEW' && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── DESKTOP HEADER ─────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <div className="flex items-start justify-between gap-8 pb-6 border-b mb-8">
          <div className="space-y-1">
            <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
              {t('stepCounter', { current: wizard.state.currentStep, total: totalSteps })}
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
              onStepClick={(i) => wizard.goToStep(i + 1)}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* ── MOBILE HEADER ──────────────────────────────────────────────── */}
      <div className="lg:hidden mb-6">
        <div className="flex justify-center mb-4">
          <RegisterStepIndicator
            steps={STEPS}
            currentStep={indicatorStep}
            onStepClick={(i) => wizard.goToStep(i + 1)}
            size="sm"
          />
        </div>
        <div className="text-center space-y-0.5">
          <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('stepCounter', { current: wizard.state.currentStep, total: totalSteps })}
          </p>
          <h3 className="text-base font-bold tracking-tight">{STEPS[indicatorStep]?.title}</h3>
          <p className="text-xs text-muted-foreground">{STEPS[indicatorStep]?.desc}</p>
        </div>
      </div>

      {/* ── STEP CONTENT ───────────────────────────────────────────────── */}
      <div className="min-h-[300px]">
        {renderStep()}
      </div>

      {/* ── NAV ────────────────────────────────────────────────────────── */}
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

      {/* ── SIGN-IN LINK ───────────────────────────────────────────────── */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        {t('alreadyHaveStore')}{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          {t('signInLink')}
        </Link>
      </p>

      {/* ── VALIDATION DIALOG ──────────────────────────────────────────── */}
      <ValidationDialog
        open={validationOpen}
        onClose={() => setValidationOpen(false)}
        items={validationItems}
      />

      {/* ── SLUG CONFLICT DIALOG ───────────────────────────────────────── */}
      <AlertDialog
        open={slugConflictOpen}
        onOpenChange={(open) => {
          setSlugConflictOpen(open);
          if (!open) resetRegister();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('slugConflict.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('slugConflict.description', { slug: wizard.state.slug || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {slugSuggestions.length > 0 && (
            <div className="py-2">
              <p className="text-xs text-muted-foreground mb-2">{t('slugConflict.suggestionsLabel')}</p>
              <div className="flex flex-wrap gap-1.5">
                {slugSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handlePickSuggestion(s)}
                    className="inline-flex items-center rounded-full border border-input bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>{t('slugConflict.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setSlugConflictOpen(false);
                resetRegister();
                wizard.goToStep(3); // StoreInfo step
              }}
            >
              {t('slugConflict.editManuallyButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
