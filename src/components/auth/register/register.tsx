'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRegisterWizard } from '@/hooks/auth/use-register-wizard';
import { useRegister } from '@/hooks/auth/use-auth';
import { StepCategory } from './step-category';
import { StepStoreInfo } from './step-store-info';
import { StepAccount } from './step-account';
import { StepReview } from './step-review';
import { StepWelcome } from './step-welcome';
import { StepIndicator } from '@/components/dashboard/shared/step-wizard';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import { toast } from 'sonner';

const STEPS = [
  { title: 'Business Type', desc: 'What kind of business do you run?' },
  { title: 'Store Details', desc: 'Name, URL & description' },
  { title: 'Your Account', desc: 'Email, password & WhatsApp' },
  { title: 'Review', desc: 'Confirm and launch your store' },
] as const;

function isPasswordStrong(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export function RegisterForm() {
  const wizard = useRegisterWizard();
  const { register, isLoading, error } = useRegister();
  const [isAgreed, setIsAgreed] = useState(false);

  const isWelcome = wizard.state.currentStep === 1;
  const indicatorStep = wizard.state.currentStep - 2;

  const validateCurrentStep = (): boolean => {
    switch (wizard.state.currentStep) {
      case 2:
        if (!wizard.state.category) {
          toast.error('Please select a business type to continue');
          return false;
        }
        return true;
      case 3:
        if (!wizard.state.name?.trim()) {
          toast.error('Store name is required');
          return false;
        }
        if (!wizard.state.slug?.trim()) {
          toast.error('Store URL is required');
          return false;
        }
        return true;
      case 4:
        if (!wizard.state.email?.trim()) {
          toast.error('Email address is required');
          return false;
        }
        if (!wizard.state.password) {
          toast.error('Password is required');
          return false;
        }
        if (!isPasswordStrong(wizard.state.password)) {
          toast.error('Password must meet all requirements');
          return false;
        }
        if (!wizard.state.whatsapp || wizard.state.whatsapp === '62') {
          toast.error('WhatsApp number is required');
          return false;
        }
        return true;
      case 5:
        if (!isAgreed) {
          toast.error('Please agree to the Terms of Service to continue');
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
      // Error ditangani di hook
    }
  };

  // ── WELCOME SCREEN ────────────────────────────────────────────────────
  if (isWelcome) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <StepWelcome onNext={wizard.nextStep} />
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have a store?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  // ── WIZARD (step 2–5) ─────────────────────────────────────────────────
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
    <div className="w-full max-w-2xl mx-auto h-full flex flex-col">

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ══════════ DESKTOP ══════════ */}
      <div className="hidden lg:flex lg:flex-col lg:h-full">
        <div className="flex items-start justify-between gap-8 pb-6 border-b mb-8">
          <div className="space-y-1">
            <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
              Step {wizard.state.currentStep - 1} of {STEPS.length}
            </p>
            <h2 className="text-2xl font-bold tracking-tight leading-none">
              {STEPS[indicatorStep]?.title}
            </h2>
            <p className="text-sm text-muted-foreground pt-0.5">
              {STEPS[indicatorStep]?.desc}
            </p>
          </div>
          <div className="shrink-0 pt-0.5">
            <StepIndicator
              steps={STEPS}
              currentStep={indicatorStep}
              onStepClick={(i) => wizard.goToStep(i + 2)}
              size="lg"
            />
          </div>
        </div>

        <div className="flex-1 min-h-[340px] pb-20">
          {stepContent}
        </div>

        <p className="hidden lg:block text-center text-sm text-muted-foreground mt-4">
          Already have a store?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>

      {/* ══════════ MOBILE ══════════ */}
      <div className="lg:hidden flex flex-col pb-24">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <StepIndicator
              steps={STEPS}
              currentStep={indicatorStep}
              onStepClick={(i) => wizard.goToStep(i + 2)}
              size="sm"
            />
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">
              Step {wizard.state.currentStep - 1} of {STEPS.length}
            </p>
            <h3 className="text-base font-bold tracking-tight">
              {STEPS[indicatorStep]?.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {STEPS[indicatorStep]?.desc}
            </p>
          </div>
        </div>

        <div className="min-h-[300px]">
          {stepContent}
        </div>
      </div>

      <WizardNav
        steps={STEPS}
        currentStep={indicatorStep}
        onPrev={wizard.prevStep}
        onNext={handleNext}
        onSave={handleSubmit}
        isSaving={isLoading}
        lastStepLabel={isLoading ? 'Creating...' : 'Create my store'}
        lastStepSavingLabel="Creating..."
        onLastStep={handleSubmit}
      />
    </div>
  );
}