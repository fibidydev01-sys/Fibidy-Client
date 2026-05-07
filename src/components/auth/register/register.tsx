'use client';

// ==========================================
// REGISTER FORM
// File: src/components/auth/register/register.tsx
//
// [VERCEL VIBES — May 2026]
// Auth-only step indicator + nav (decoupled from dashboard wizards).
// See register-step-indicator.tsx + register-nav.tsx for the duplicated
// primitives. Behavior unchanged from Phase 2 except where noted below.
//
// Phase 3 (Interactive Store Builder, May 2026):
//
// 🔵 NEW — Builder handoff
//   When useRegisterWizard pre-fills slug/category from query params,
//   this form lands the user on Step 4 (Account) directly. No code
//   needed here; the hook decides where to start.
//
// 🔵 NEW — agreementAccepted in register payload
//   Phase 1 BE rewrote `RegisterDto` with `@Equals(true) agreementAccepted`.
//   We pass `true` always — the user MUST tick the Review checkbox to
//   reach this point (validateCurrentStep blocks otherwise), so by
//   construction it's always `true` at submit time.
//
// 🔵 NEW — SLUG_TAKEN_AFTER_PREVIEW handling
//   When BE returns 409 with code SLUG_TAKEN_AFTER_PREVIEW (race lost
//   between marketing builder check and final insert), we surface an
//   AlertDialog with up to 4 suggestion chips. Tapping a chip rewrites
//   slug, closes dialog, user resubmits.
//
// 🔵 NEW — EMAIL_TAKEN_AFTER_PREVIEW handling
//   Auto-jumps user back to Step 4 (Account) so they can update email.
//   Toast already shown by useRegister.
//
// [v15.5 — May 2026]
// 🔵 isAgreed default = true.
//   Frictionless flow for ID-only deployment. Builder pre-tick effect
//   below is now redundant for the default-arrival case but kept
//   intentionally — it acts as a hard-reassert if some future code
//   path resets the local state. Cheap, safe, no behavior change.
//   NOTE: Revisit when EU/UK markets are added — pre-checked consent
//   is invalid under GDPR Art. 4(11) (CJEU Planet49, 2019).
// ==========================================

import { useEffect, useState } from 'react';
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
import { useRegisterWizard } from '@/hooks/auth/use-register-wizard';
import { useRegister } from '@/hooks/auth/use-auth';
import { generateSlugSuggestions } from '@/lib/utils/slug-suggestions';
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
  const { register, isLoading, error, errorCode, reset: resetRegister } =
    useRegister();
  // Review step's agreement checkbox state.
  // v15.5: defaults to TRUE (pre-checked). User can untick if they
  // change their mind. Builder handoff effect below re-asserts true
  // defensively in case some future flow resets it.
  const [isAgreed, setIsAgreed] = useState(true);

  // ── Pre-tick agreement when arriving from builder ───────────────
  // Runs once, after the wizard finishes resolving cameFromBuilder.
  // Redundant given the new default but retained as a defensive
  // re-assert — cheap, no observable behavior change.
  useEffect(() => {
    if (wizard.cameFromBuilder) {
      setIsAgreed(true);
    }
  }, [wizard.cameFromBuilder]);

  // ── Slug-taken AlertDialog state ────────────────────────────────
  const [slugConflictOpen, setSlugConflictOpen] = useState(false);
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);

  // ── Watch errorCode → react to BE-specific failures ─────────────
  useEffect(() => {
    if (!errorCode) return;

    if (errorCode === 'SLUG_TAKEN_AFTER_PREVIEW') {
      const suggestions = wizard.state.slug
        ? generateSlugSuggestions(wizard.state.slug)
        : [];
      setSlugSuggestions(suggestions);
      setSlugConflictOpen(true);
    } else if (errorCode === 'EMAIL_TAKEN_AFTER_PREVIEW') {
      // Send user back to Step 4 (Account) so they can change email
      wizard.goToStep(4);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorCode]);

  const STEPS = [
    {
      title: t('stepsMeta.businessType.title'),
      desc: t('stepsMeta.businessType.desc'),
    },
    {
      title: t('stepsMeta.storeDetails.title'),
      desc: t('stepsMeta.storeDetails.desc'),
    },
    {
      title: t('stepsMeta.yourAccount.title'),
      desc: t('stepsMeta.yourAccount.desc'),
    },
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
        // Phase 1 BE requires this; Review step gate already enforced isAgreed.
        agreementAccepted: true,
      });
    } catch {
      // Error handled in hook + via errorCode effect above
    }
  };

  // ── Slug suggestion picker (from AlertDialog) ───────────────────
  const handlePickSuggestion = (suggestion: string) => {
    wizard.updateState({ slug: suggestion });
    setSlugConflictOpen(false);
    setSlugSuggestions([]);
    resetRegister();
    // Don't auto-resubmit — user might want to verify the new slug
    // first. They can click submit again themselves.
    toast.success(t('slugConflict.appliedToast', { slug: suggestion }));
  };

  // ── WELCOME SCREEN ──────────────────────────────────────────────
  if (isWelcome) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <StepWelcome onNext={wizard.nextStep} />
        <p className="text-center text-sm text-muted-foreground mt-6">
          {t('alreadyHaveStore')}{' '}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            {t('signInLink')}
          </Link>
        </p>
      </div>
    );
  }

  // ── STEP CONTENT (rendered ONCE) ────────────────────────────────
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
          isAgreed={isAgreed}
          onAgreementChange={setIsAgreed}
          cameFromBuilder={wizard.cameFromBuilder}
        />
      )}
    </>
  );

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col">
      {error && errorCode !== 'SLUG_TAKEN_AFTER_PREVIEW' && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ══════════ DESKTOP HEADER ══════════ */}
      <div className="hidden lg:block">
        <div className="flex items-start justify-between gap-8 pb-6 border-b mb-8">
          <div className="space-y-1">
            <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
              {t('stepCounter', {
                current: wizard.state.currentStep - 1,
                total: STEPS.length,
              })}
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
            {t('stepCounter', {
              current: wizard.state.currentStep - 1,
              total: STEPS.length,
            })}
          </p>
          <h3 className="text-base font-bold tracking-tight">
            {STEPS[indicatorStep]?.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {STEPS[indicatorStep]?.desc}
          </p>
        </div>
      </div>

      {/* ══════════ STEP CONTENT ══════════ */}
      <div className="min-h-[300px]">{stepContent}</div>

      {/* ══════════ INLINE NAV ══════════ */}
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
        <Link
          href="/login"
          className="text-primary hover:underline font-medium"
        >
          {t('signInLink')}
        </Link>
      </p>

      {/* ══════════ SLUG CONFLICT DIALOG ══════════ */}
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
              {t('slugConflict.description', {
                slug: wizard.state.slug || '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {slugSuggestions.length > 0 && (
            <div className="py-2">
              <p className="text-xs text-muted-foreground mb-2">
                {t('slugConflict.suggestionsLabel')}
              </p>
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
            <AlertDialogCancel>
              {t('slugConflict.cancelButton')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // Send user to Step 3 (StoreInfo) so they can pick manually
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