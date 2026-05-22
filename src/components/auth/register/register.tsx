'use client';

// ============================================================================
// REGISTER FORM
// File: src/components/auth/register/register.tsx
//
// [PHASE C v2 — May 2026]
// DIALOG STRATEGY:
//   - Next/Submit button: SELALU ENABLED (tidak pernah disabled/silent)
//   - Klik Next dengan kondisi invalid → buka ValidationDialog
//   - ValidationDialog menampilkan list field yang perlu diperbaiki
//   - User HARUS klik "OK, saya perbaiki" sebelum bisa dismiss dialog
//
// Soft alerts tetap berjalan inline:
//   - Password rules checklist (real-time)
//   - Slug availability indicator (real-time)
//   - Description char counter
//
// isStepValid() masih ada tapi HANYA untuk memutuskan apakah buka dialog
// atau langsung lanjut — bukan untuk disable button.
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
import { useRegisterWizard } from '@/hooks/auth/use-register-wizard';
import { useRegister, useCheckSlug } from '@/hooks/auth/use-auth';
import { useDebounce } from '@/hooks/shared/use-debounce';
import { generateSlugSuggestions } from '@/lib/utils/slug-suggestions';
import { validateSlugFormat } from '@/lib/constants/shared/slug.constants';
import { StepCategory } from './step-category';
import { StepStoreInfo } from './step-store-info';
import { StepAccount } from './step-account';
import { StepReview } from './step-review';
import { StepWelcome } from './step-welcome';
import { RegisterStepIndicator } from './register-step-indicator';
import { RegisterNav } from './register-nav';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

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
  // Minimal 7 digit setelah kode negara
  const digits = whatsapp.replace(/\D/g, '');
  return digits.length >= 7;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function RegisterForm() {
  const t = useTranslations('auth.register');
  const wizard = useRegisterWizard();
  const { register, isLoading, error, errorCode, reset: resetRegister } = useRegister();
  const { checkSlug, isChecking, isAvailable, reset: resetSlug } = useCheckSlug();

  const [isAgreed, setIsAgreed] = useState(true);

  // Validation dialog state
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);

  // Debounced slug check
  const debouncedSlug = useDebounce(wizard.state.slug || '', 500);

  useEffect(() => {
    if (debouncedSlug && debouncedSlug.length >= 3) {
      checkSlug(debouncedSlug);
    } else {
      resetSlug();
    }
  }, [debouncedSlug, checkSlug, resetSlug]);

  // Pre-tick agreement from builder
  useEffect(() => {
    if (wizard.cameFromBuilder) setIsAgreed(true);
  }, [wizard.cameFromBuilder]);

  // Slug conflict dialog
  const [slugConflictOpen, setSlugConflictOpen] = useState(false);
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!errorCode) return;
    if (errorCode === 'SLUG_TAKEN_AFTER_PREVIEW') {
      const suggestions = wizard.state.slug ? generateSlugSuggestions(wizard.state.slug) : [];
      setSlugSuggestions(suggestions);
      setSlugConflictOpen(true);
    } else if (errorCode === 'EMAIL_TAKEN_AFTER_PREVIEW') {
      wizard.goToStep(4);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorCode]);

  const STEPS = [
    { title: t('stepsMeta.businessType.title'), desc: t('stepsMeta.businessType.desc') },
    { title: t('stepsMeta.storeDetails.title'), desc: t('stepsMeta.storeDetails.desc') },
    { title: t('stepsMeta.yourAccount.title'), desc: t('stepsMeta.yourAccount.desc') },
    { title: t('stepsMeta.review.title'), desc: t('stepsMeta.review.desc') },
  ] as const;

  const isWelcome = wizard.state.currentStep === 1;
  const indicatorStep = wizard.state.currentStep - 2;

  // ── Collect validation errors per step ──────────────────────────────────
  // Returns array of human-readable error strings.
  // Empty array = step valid.

  const getStepErrors = useMemo(() => {
    return (step: number): string[] => {
      const s = wizard.state;
      const errors: string[] = [];

      switch (step) {
        case 2:
          if (!s.category?.trim()) errors.push(t('errors.categoryRequired'));
          break;
        case 3:
          if (!s.name || s.name.trim().length < 3) errors.push(t('errors.nameRequired'));
          if (!s.slug || s.slug.length < 3 || !validateSlugFormat(s.slug).valid)
            errors.push(t('errors.slugRequired'));
          if (isChecking) errors.push(t('errors.slugChecking'));
          if (isAvailable === false) errors.push(t('errors.slugTaken'));
          break;
        case 4:
          if (!s.email || !isEmailValid(s.email)) errors.push(t('errors.emailInvalid'));
          if (!s.password || !isPasswordStrong(s.password)) errors.push(t('errors.passwordWeak'));
          if (!s.whatsapp || !isPhoneValid(s.whatsapp)) errors.push(t('errors.whatsappRequired'));
          break;
        case 5:
          if (!isAgreed) errors.push(t('errors.agreementRequired'));
          break;
      }
      return errors;
    };
  }, [wizard.state, isChecking, isAvailable, isAgreed, t]);

  // ── Handle Next — show dialog if invalid, else advance ──────────────────

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
      await register({
        name: wizard.state.name!,
        slug: wizard.state.slug!,
        category: wizard.state.category!,
        description: wizard.state.description || '',
        email: wizard.state.email!,
        password: wizard.state.password!,
        whatsapp: wizard.state.whatsapp!,
        agreementAccepted: true,
      });
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

  // ── Welcome screen ───────────────────────────────────────────────────────
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

      {/* ── MOBILE HEADER ──────────────────────────────────────────────── */}
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
          <h3 className="text-base font-bold tracking-tight">{STEPS[indicatorStep]?.title}</h3>
          <p className="text-xs text-muted-foreground">{STEPS[indicatorStep]?.desc}</p>
        </div>
      </div>

      {/* ── STEP CONTENT ───────────────────────────────────────────────── */}
      <div className="min-h-[300px]">
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
            isChecking={isChecking}
            isAvailable={isAvailable}
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
            isAgreed={isAgreed}
            onAgreementChange={setIsAgreed}
            cameFromBuilder={wizard.cameFromBuilder}
          />
        )}
      </div>

      {/* ── NAV — button selalu enabled ────────────────────────────────── */}
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
                wizard.goToStep(3);
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
