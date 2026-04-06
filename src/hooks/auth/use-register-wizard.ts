'use client';

import { useState } from 'react';
import type { RegisterFormData } from '@/lib/shared/validations';

// ==========================================
// TYPES
// ==========================================

interface WizardState extends Partial<RegisterFormData> {
  currentStep: number;
}

const TOTAL_STEPS = 5;

// ==========================================
// HOOK
// ==========================================

export function useRegisterWizard() {
  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    category: '',
    name: '',
    slug: '',
    description: '',
    email: '',
    password: '',
    whatsapp: '',
  });

  const updateState = (data: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (state.currentStep < TOTAL_STEPS) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const prevStep = () => {
    if (state.currentStep > 1) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setState((prev) => ({ ...prev, currentStep: step }));
    }
  };

  const reset = () => {
    setState({
      currentStep: 1,
      category: '',
      name: '',
      slug: '',
      description: '',
      email: '',
      password: '',
      whatsapp: '',
    });
  };

  return {
    state,
    updateState,
    nextStep,
    prevStep,
    goToStep,
    reset,
    progress: (state.currentStep / TOTAL_STEPS) * 100,
    isFirstStep: state.currentStep === 1,
    isLastStep: state.currentStep === TOTAL_STEPS,
    totalSteps: TOTAL_STEPS,
  };
}
