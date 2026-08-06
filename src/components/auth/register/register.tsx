'use client';

// ============================================================================
// REGISTER FORM
// File: src/components/auth/register/register.tsx
//
// [SPRINT 5 — FIELD HIGHLIGHT + VALIDATION DIALOG]
// - Tambah fieldErrors: Set<string> state di orchestrator
// - Setiap step menerima fieldErrors + onClearFieldError props
// - ValidationDialog tetap dipakai untuk semua error
// - Saat user klik OK di dialog → field highlight merah
// - Merah hilang saat user mulai edit field tersebut
// - EMAIL_TAKEN_AFTER_PREVIEW → jump ke StepAccount + dialog + highlight email
//
// [LAYOUT FIX — May 2026]
// [STEP WELCOME — May 2026]
// [PASSWORD FIX — May 2026]
// ============================================================================

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/shared/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ValidationDialog } from '@/components/ui/validation-dialog';
import { SlugConflictDialog } from './slug-conflict-dialog';
import {
  useRegisterWizard,
  getTotalSteps,
  getAccountStep,
} from '@/hooks/auth/use-register-wizard';
import { useRegister, useCheckSlug, useCheckEmail } from '@/hooks/auth/use-auth';
import { useDebounce } from '@/hooks/shared/use-debounce';
import { generateSlugSuggestions } from '@/lib/utils/slug-suggestions';
import { validateSlugFormat } from '@/lib/constants/shared/slug.constants';
import { deriveRegisterImage } from '@/lib/utils/register-image-provider';
import { isPasswordStrong } from '@/lib/shared/validations/password';
import { isEmailValid } from '@/lib/shared/validations/email';
import { StepWelcome } from './step-welcome';
import { StepIntent } from './step-intent';
import { StepCategory } from './step-category';
import { StepStoreInfo } from './step-store-info';
import { StepAccount } from './step-account';
import { StepReview } from './step-review';
import { RegisterStepIndicator } from './register-step-indicator';
import { RegisterNav } from './register-nav';
import { ApiRequestError } from '@/lib/api/client';
import type { RegisterIntent } from '@/types/auth';

// ============================================================================
// HELPERS
// ============================================================================

function isPhoneValid(whatsapp: string): boolean {
  if (!whatsapp) return false;
  const digits = whatsapp.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 15;
}

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
  return [
    { title: t('stepsMeta.whoAreYou.title'), desc: t('stepsMeta.whoAreYou.desc') },
    { title: t('stepsMeta.businessType.title'), desc: t('stepsMeta.businessType.desc') },
    { title: t('stepsMeta.storeDetails.title'), desc: t('stepsMeta.storeDetails.desc') },
    { title: t('stepsMeta.yourAccount.title'), desc: t('stepsMeta.yourAccount.desc') },
    { title: t('stepsMeta.review.title'), desc: t('stepsMeta.review.desc') },
  ];
}

function shouldCenterContent(
  currentStep: number,
  intent: RegisterIntent | null,
): boolean {
  if (intent !== 'BUYER' && currentStep === 2) return false;
  return true;
}

// ============================================================================
// EMAIL TAKEN CODES — semua kemungkinan code dari BE untuk email conflict
// Module-level agar bisa dipakai di useMemo + useEffect tanpa dependency issue
// ============================================================================

const EMAIL_TAKEN_CODES = [
  'EMAIL_TAKEN_AFTER_PREVIEW',
  'EMAIL_TAKEN',
  'EMAIL_ALREADY_EXISTS',
  'DUPLICATE_EMAIL',
];

// ============================================================================
// COMPONENT
// ============================================================================

interface RegisterFormProps {
  onImageChange?: (url: string) => void;
}

export function RegisterForm({ onImageChange }: RegisterFormProps) {
  const t = useTranslations('auth.register');
  const wizard = useRegisterWizard();
  const {
    register,
    registerBuyer,
    isLoading,
    error,
    errorCode,
    reset: resetRegister,
  } = useRegister();
  const { checkSlug, isChecking, isAvailable, reset: resetSlug } = useCheckSlug();
  const { checkEmail, isChecking: isCheckingEmail, isAvailable: isEmailAvailable, reset: resetEmail } = useCheckEmail();

  const [isAgreed, setIsAgreed] = useState(true);
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);
  const [slugConflictOpen, setSlugConflictOpen] = useState(false);
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);

  // [SPRINT 5] Field error highlight state
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  const debouncedSlug = useDebounce(wizard.state.slug || '', 500);
  const debouncedEmail = useDebounce(wizard.state.email || '', 600);

  useEffect(() => {
    const url = deriveRegisterImage({
      currentStep: wizard.state.currentStep,
      intent: wizard.state.intent,
      category: wizard.state.category,
    });
    onImageChange?.(url);
  }, [wizard.state.currentStep, wizard.state.intent, wizard.state.category, onImageChange]);

  useEffect(() => {
    if (debouncedSlug && debouncedSlug.length >= 3) {
      checkSlug(debouncedSlug);
    } else {
      resetSlug();
    }
  }, [debouncedSlug, checkSlug, resetSlug]);

  // [SPRINT 5] Check email availability saat user ketik di Step 4
  useEffect(() => {
    const step = wizard.state.currentStep;
    const currentIntent = wizard.state.intent;
    const accountStep = currentIntent === 'BUYER' ? 2 : 4;
    if (step === accountStep && debouncedEmail && debouncedEmail.includes('@')) {
      checkEmail(debouncedEmail);
    } else {
      resetEmail();
    }
  }, [debouncedEmail, wizard.state.currentStep, wizard.state.intent, checkEmail, resetEmail]);

  useEffect(() => {
    if (!errorCode && !error) return;

    if (errorCode === 'SLUG_TAKEN_AFTER_PREVIEW') {
      const suggestions = wizard.state.slug
        ? generateSlugSuggestions(wizard.state.slug)
        : [];
      setSlugSuggestions(suggestions);
      setSlugConflictOpen(true);
    } else if (
      (errorCode && EMAIL_TAKEN_CODES.includes(errorCode)) ||
      (error && error.toLowerCase().includes('email'))
    ) {
      // [SPRINT 5] Jump ke StepAccount + ValidationDialog + highlight email
      wizard.goToStep(getAccountStep(wizard.state.intent));
      setValidationItems([t('errors.emailTaken')]);
      setValidationOpen(true);
      setFieldErrors(new Set(['email']));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorCode, error]);

  // [SPRINT 5] Clear field error saat user mulai edit
  const handleClearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, []);

  const intent = wizard.state.intent;
  const STEPS = useMemo(() => getStepDefs(intent, t), [intent, t]);

  const indicatorStep = wizard.state.currentStep - 1;
  const isWelcomeStep = wizard.state.currentStep === 0;

  const centerContent = shouldCenterContent(wizard.state.currentStep, intent);

  // ============================================================================
  // STEP VALIDATION — returns error keys + sets fieldErrors
  // ============================================================================

  const getStepErrors = useMemo(() => {
    return (step: number): string[] => {
      const s = wizard.state;
      const errors: string[] = [];
      switch (step) {
        case 0:
          break;
        case 1:
          if (!s.intent) errors.push(t('errors.intentRequired'));
          break;
        case 2:
          if (intent === 'BUYER') {
            if (!s.email || !isEmailValid(s.email)) errors.push(t('errors.emailInvalid'));
            if (!s.password || !isPasswordStrong(s.password)) errors.push(t('errors.passwordWeak'));
          } else {
            if (!s.category?.trim()) errors.push(t('errors.categoryRequired'));
          }
          break;
        case 3:
          if (intent === 'BUYER') {
            if (!isAgreed) errors.push(t('errors.agreementRequired'));
          } else {
            if (!s.name || s.name.trim().length === 0) {
              errors.push(t('errors.nameRequired'));
            } else if (s.name.trim().length < 3) {
              errors.push(t('errors.nameTooShort'));
            }
            if (!s.slug || s.slug.length === 0) {
              errors.push(t('errors.slugRequired'));
            } else if (s.slug.length < 3) {
              errors.push(t('errors.slugTooShort'));
            } else if (!validateSlugFormat(s.slug).valid) {
              errors.push(t('errors.slugInvalidFormat'));
            } else if (isChecking) {
              errors.push(t('errors.slugChecking'));
            } else if (isAvailable === false) {
              errors.push(t('errors.slugTaken'));
            }
          }
          break;
        case 4:
          if (!s.email || !isEmailValid(s.email)) errors.push(t('errors.emailInvalid'));
          // [SPRINT 5] Block Next kalau email taken — dari check realtime ATAU dari errorCode BE
          if (isEmailAvailable === false || (errorCode && EMAIL_TAKEN_CODES.includes(errorCode))) {
            errors.push(t('errors.emailTaken'));
          }
          if (isCheckingEmail) errors.push(t('errors.emailChecking'));
          if (!s.password || !isPasswordStrong(s.password)) errors.push(t('errors.passwordWeak'));
          if (!s.whatsapp || !isPhoneValid(s.whatsapp)) errors.push(t('errors.whatsappRequired'));
          break;
        case 5:
          if (!isAgreed) errors.push(t('errors.agreementRequired'));
          break;
      }
      return errors;
    };
  }, [wizard.state, intent, isChecking, isAvailable, isAgreed, isEmailAvailable, isCheckingEmail, errorCode, t]);

  // ============================================================================
  // COMPUTE FIELD ERRORS PER STEP — untuk highlight
  // ============================================================================

  const computeFieldErrorsForStep = useCallback((step: number): Set<string> => {
    const s = wizard.state;
    const fields = new Set<string>();
    switch (step) {
      case 1:
        if (!s.intent) fields.add('intent');
        break;
      case 2:
        if (intent === 'BUYER') {
          if (!s.email || !isEmailValid(s.email)) fields.add('email');
          if (!s.password || !isPasswordStrong(s.password)) fields.add('password');
        } else {
          if (!s.category?.trim()) fields.add('category');
        }
        break;
      case 3:
        if (intent === 'BUYER') {
          if (!isAgreed) fields.add('agreement');
        } else {
          if (!s.name || s.name.trim().length < 3) fields.add('name');
          if (
            !s.slug ||
            s.slug.length < 3 ||
            !validateSlugFormat(s.slug).valid ||
            isAvailable === false
          ) fields.add('slug');
        }
        break;
      case 4:
        if (!s.email || !isEmailValid(s.email)) fields.add('email');
        if (isEmailAvailable === false || (errorCode && EMAIL_TAKEN_CODES.includes(errorCode))) fields.add('email');
        if (!s.password || !isPasswordStrong(s.password)) fields.add('password');
        if (!s.whatsapp || !isPhoneValid(s.whatsapp)) fields.add('whatsapp');
        break;
      case 5:
        if (!isAgreed) fields.add('agreement');
        break;
    }
    return fields;
  }, [wizard.state, intent, isAgreed, isAvailable, isEmailAvailable, errorCode]);

  // ============================================================================
  // NAVIGATION HANDLERS
  // ============================================================================

  const handleNext = () => {
    const errors = getStepErrors(wizard.state.currentStep);
    if (errors.length > 0) {
      setValidationItems(errors);
      setValidationOpen(true);
      // Set field errors untuk highlight — akan aktif setelah user klik OK
      const fields = computeFieldErrorsForStep(wizard.state.currentStep);
      setFieldErrors(fields);
      return;
    }
    // Reset field errors saat berhasil next
    setFieldErrors(new Set());
    wizard.nextStep();
  };

  const handleSubmit = async () => {
    const errors = getStepErrors(wizard.state.currentStep);
    if (errors.length > 0) {
      setValidationItems(errors);
      setValidationOpen(true);
      const fields = computeFieldErrorsForStep(wizard.state.currentStep);
      setFieldErrors(fields);
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

  const handleEditManually = () => {
    setSlugConflictOpen(false);
    resetRegister();
    wizard.goToStep(3);
  };

  const handleSlugConflictClose = () => {
    setSlugConflictOpen(false);
    resetRegister();
  };

  // ============================================================================
  // RENDER STEPS
  // ============================================================================

  const renderStep = () => {
    const { currentStep } = wizard.state;

    if (currentStep === 0) {
      return <StepWelcome onNext={wizard.nextStep} />;
    }

    if (currentStep === 1) {
      return (
        <StepIntent
          selected={wizard.state.intent}
          onSelect={(selectedIntent) => {
            wizard.selectIntent(selectedIntent);
            handleClearFieldError('intent');
          }}
          fieldErrors={fieldErrors}
          onClearFieldError={handleClearFieldError}
        />
      );
    }

    if (intent === 'BUYER') {
      if (currentStep === 2) {
        return (
          <StepAccount
            email={wizard.state.email || ''}
            password={wizard.state.password || ''}
            whatsapp=""
            hiddenFields={['whatsapp']}
            onUpdate={wizard.updateState}
            fieldErrors={fieldErrors}
            onClearFieldError={handleClearFieldError}
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
            fieldErrors={fieldErrors}
            onClearFieldError={handleClearFieldError}
          />
        );
      }
    }

    if (currentStep === 2) {
      return (
        <StepCategory
          selectedCategory={wizard.state.category || ''}
          onSelectCategory={(category) => {
            wizard.updateState({ category });
            handleClearFieldError('category');
          }}
          fieldErrors={fieldErrors}
          onClearFieldError={handleClearFieldError}
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
          fieldErrors={fieldErrors}
          onClearFieldError={handleClearFieldError}
        />
      );
    }
    if (currentStep === 4) {
      return (
        <StepAccount
          email={wizard.state.email || ''}
          password={wizard.state.password || ''}
          whatsapp={wizard.state.whatsapp || ''}
          onUpdate={(data) => {
            // [SPRINT 5] Reset email check + errorCode saat user edit email
            if (data.email !== undefined) {
              resetEmail();
              resetRegister();
            }
            wizard.updateState(data);
          }}
          fieldErrors={fieldErrors}
          onClearFieldError={handleClearFieldError}
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
          fieldErrors={fieldErrors}
          onClearFieldError={handleClearFieldError}
        />
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full">

      {/* ERROR ALERT — tidak tampil untuk email/slug conflict, ditangani via dialog */}
      {error &&
        errorCode !== 'SLUG_TAKEN_AFTER_PREVIEW' &&
        !EMAIL_TAKEN_CODES.includes(errorCode ?? '') &&
        !(error.toLowerCase().includes('email')) && (
        <Alert variant="destructive" className="mb-3 shrink-0">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-10 bg-background shrink-0">
        {isWelcomeStep ? (
          <div className="pt-6" />
        ) : (
          <div className="pt-6 pb-4 border-b">
            <div className="flex justify-center mb-3">
              <RegisterStepIndicator
                steps={STEPS}
                currentStep={indicatorStep}
                onStepClick={(i) => wizard.goToStep(i + 1)}
                size="sm"
              />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xl font-bold tracking-tight leading-snug">
                {STEPS[indicatorStep]?.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-snug">
                {STEPS[indicatorStep]?.desc}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SCROLLABLE BODY */}
      <div
        className={cn(
          'flex-1 overflow-y-auto py-5 px-1 overscroll-contain',
          centerContent && 'flex flex-col justify-center items-stretch',
        )}
        style={{ touchAction: 'pan-y' }}
      >
        {renderStep()}
      </div>

      {/* FOOTER — RegisterNav is self-styled (pill, sticky, shadow) now;
          this wrapper only provides breathing room so the pill's shadow
          isn't clipped by the column's `overflow-hidden` above it. */}
      <div className="pt-4 pb-4 shrink-0">
        <RegisterNav
          steps={STEPS}
          currentStep={indicatorStep}
          onPrev={wizard.prevStep}
          onNext={handleNext}
          onLastStep={handleSubmit}
          isSaving={isLoading}
          isWelcomeStep={isWelcomeStep}
          lastStepLabel={t('review.submitButton')}
          lastStepSavingLabel={t('review.submittingButton')}
          backHref="/"
        />
      </div>

      {/* DIALOGS */}
      <ValidationDialog
        open={validationOpen}
        onClose={() => setValidationOpen(false)}
        items={validationItems}
      />
      <SlugConflictDialog
        open={slugConflictOpen}
        conflictingSlug={wizard.state.slug || ''}
        suggestions={slugSuggestions}
        onClose={handleSlugConflictClose}
        onPickSuggestion={handlePickSuggestion}
        onEditManually={handleEditManually}
      />

    </div>
  );
}
