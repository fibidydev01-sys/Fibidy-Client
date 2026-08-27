'use client';

// ============================================================================
// USE REGISTER WIZARD
// File: src/hooks/auth/use-register-wizard.ts
//
// [SPRINT 2 — A-H4 FIX: cameFromBuilder sessionStorage cleanup on success]
// sessionStorage 'fibidy_builder_agreement' sebelumnya hanya di-clear di
// reset() — yang hanya dipanggil manual, BUKAN di success path register.
// Akibatnya: orphaned entry tersisa di sessionStorage untuk visit berikutnya.
//
// Fix: export helper clearBuilderBridge() yang dipanggil dari useRegister
// success path di use-auth.ts Sprint 2.
// Nama export sengaja di-expose agar consumer (use-auth.ts) bisa import
// tanpa perlu import seluruh hook (circular dependency avoided).
//
// [STEP WELCOME — May 2026]
// Step 0 (Welcome) sebagai entry point sebelum StepIntent.
// ============================================================================

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { RegisterFormData } from '@/lib/shared/validations';
import {
  validateSlugFormat,
  SLUG_MAX_LENGTH,
} from '@/lib/constants/shared/slug.constants';
import { isReservedSubdomain } from '@/lib/constants/shared/reserved-subdomains';
import { getCategoryConfig } from '@/lib/constants/shared/categories';
import type { RegisterIntent } from '@/types/auth';

// ============================================================
// CONSTANTS
// ============================================================

const AGREEMENT_BRIDGE_KEY = 'fibidy_builder_agreement';

const STEP_WELCOME = 0;
const STEP_INTENT = 1;
const STEP_CATEGORY = 2;
const STEP_STORE_INFO = 3;
const STEP_ACCOUNT_SELLER = 4;
const STEP_REVIEW_SELLER = 5;

// ============================================================
// TYPES
// ============================================================

interface WizardState extends Partial<RegisterFormData> {
  currentStep: number;
  intent: RegisterIntent | null;
}

export interface StepDef {
  id: string;
  title: string;
  desc: string;
}

// ============================================================
// [A-H4 FIX] PUBLIC HELPER — clear builder bridge sessionStorage
//
// Dipanggil dari use-auth.ts useRegister success path agar tidak
// ada orphaned entry di sessionStorage setelah register berhasil.
// ============================================================

/**
 * Clear fibidy_builder_agreement dari sessionStorage.
 * Dipanggil setelah register berhasil ATAU saat wizard di-reset.
 */
export function clearBuilderBridge(): void {
  try {
    sessionStorage.removeItem(AGREEMENT_BRIDGE_KEY);
  } catch {
    // Private tab atau storage disabled — ignore
  }
}

// ============================================================
// HELPERS — pure
// ============================================================

function deriveNameFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function sanitizeSlugFromQuery(raw: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.toLowerCase().trim();
  if (cleaned.length === 0 || cleaned.length > SLUG_MAX_LENGTH) return null;
  if (!validateSlugFormat(cleaned).valid) return null;
  if (isReservedSubdomain(cleaned)) return null;
  return cleaned;
}

function sanitizeCategoryFromQuery(raw: string | null): string | null {
  if (!raw) return null;
  return getCategoryConfig(raw) ? raw : null;
}

export function getTotalSteps(): number {
  return 5;
}

export function getAccountStep(): number {
  return STEP_ACCOUNT_SELLER;
}

export function getReviewStep(): number {
  return STEP_REVIEW_SELLER;
}

// ============================================================
// HOOK
// ============================================================

export function useRegisterWizard() {
  const searchParams = useSearchParams();
  const [cameFromBuilder, setCameFromBuilder] = useState(false);

  const [state, setState] = useState<WizardState>(() => {
    const base: WizardState = {
      currentStep: STEP_WELCOME,
      intent: null,
      category: '',
      name: '',
      slug: '',
      description: '',
      email: '',
      password: '',
      whatsapp: '',
    };

    if (!searchParams) return base;

    const slug = sanitizeSlugFromQuery(searchParams.get('slug'));
    const category = sanitizeCategoryFromQuery(searchParams.get('category'));

    if (!slug) return base;

    const name = deriveNameFromSlug(slug);

    if (category) {
      return {
        ...base,
        slug,
        name,
        category,
        intent: 'SELLER',
        currentStep: STEP_ACCOUNT_SELLER,
      };
    }

    return {
      ...base,
      slug,
      name,
      intent: 'SELLER',
      currentStep: STEP_CATEGORY,
    };
  });

  useEffect(() => {
    if (!searchParams) return;
    const queryAgreement = searchParams.get('agreement') === 'accepted';
    let storageAgreement = false;
    try {
      storageAgreement = sessionStorage.getItem(AGREEMENT_BRIDGE_KEY) === '1';
    } catch {
      // Private tab or storage disabled
    }
    setCameFromBuilder(queryAgreement || storageAgreement);
  }, [searchParams]);

  const updateState = (data: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...data }));
  };

  const selectIntent = (intent: RegisterIntent) => {
    setState((prev) => ({
      ...prev,
      intent,
      currentStep: STEP_INTENT,
    }));
  };

  const nextStep = () => {
    setState((prev) => {
      const cur = prev.currentStep;

      if (cur === STEP_WELCOME) {
        return { ...prev, currentStep: STEP_INTENT };
      }

      const total = getTotalSteps();
      const next = cur + 1;
      if (next <= total + 1) {
        return { ...prev, currentStep: next };
      }
      return prev;
    });
  };

  const prevStep = () => {
    setState((prev) => {
      const cur = prev.currentStep;

      if (cur === STEP_INTENT) {
        return { ...prev, currentStep: STEP_WELCOME };
      }

      if (cur > STEP_WELCOME) {
        return { ...prev, currentStep: cur - 1 };
      }
      return prev;
    });
  };

  const goToStep = (step: number) => {
    const total = getTotalSteps();
    if (step >= STEP_WELCOME && step <= total + 1) {
      setState((prev) => ({ ...prev, currentStep: step }));
    }
  };

  const reset = () => {
    setState({
      currentStep: STEP_WELCOME,
      intent: null,
      category: '',
      name: '',
      slug: '',
      description: '',
      email: '',
      password: '',
      whatsapp: '',
    });
    setCameFromBuilder(false);
    // [A-H4 FIX] Pakai shared helper untuk clear sessionStorage
    clearBuilderBridge();
  };

  const totalSteps = getTotalSteps();
  const isLastStep = state.currentStep === STEP_REVIEW_SELLER;

  return {
    state,
    updateState,
    selectIntent,
    nextStep,
    prevStep,
    goToStep,
    reset,
    totalSteps,
    isFirstStep: state.currentStep === STEP_WELCOME,
    isLastStep,
    cameFromBuilder,
    STEP_WELCOME,
    STEP_INTENT,
    STEP_CATEGORY,
    STEP_STORE_INFO,
    getAccountStep,
    getReviewStep,
  };
}
