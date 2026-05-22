'use client';

// ============================================================================
// USE REGISTER WIZARD
// File: src/hooks/auth/use-register-wizard.ts
//
// [PHASE D — May 2026]
// +intent: RegisterIntent | null di state
// Dynamic step list per intent:
//   BUYER:        Intent(1) → Account(2) → Review(3)
//   SELLER / EDU: Intent(1) → Category(2) → StoreInfo(3) → Account(4) → Review(5)
//
// StepWelcome dihapus — digantikan StepIntent sebagai entry point.
// TOTAL_STEPS bersifat dynamic berdasarkan intent.
//
// [PHASE C — May 2026]
// Auto-skip dari builder query params (slug + category) masih berfungsi.
// Jika ada query params, intent default ke SELLER.
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

// Step indexes — berbeda per intent
// BUYER:        1=Intent, 2=Account, 3=Review
// SELLER / EDU: 1=Intent, 2=Category, 3=StoreInfo, 4=Account, 5=Review
const STEP_INTENT    = 1;
const STEP_CATEGORY  = 2; // SELLER/EDU only
const STEP_STORE_INFO = 3; // SELLER/EDU only
const STEP_ACCOUNT_SELLER = 4; // SELLER/EDU
const STEP_REVIEW_SELLER  = 5; // SELLER/EDU
const STEP_ACCOUNT_BUYER  = 2; // BUYER
const STEP_REVIEW_BUYER   = 3; // BUYER

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

/**
 * Returns total steps for the given intent.
 */
export function getTotalSteps(intent: RegisterIntent | null): number {
  return intent === 'BUYER' ? 3 : 5;
}

/**
 * Returns the account step index for the given intent.
 */
export function getAccountStep(intent: RegisterIntent | null): number {
  return intent === 'BUYER' ? STEP_ACCOUNT_BUYER : STEP_ACCOUNT_SELLER;
}

/**
 * Returns the review step index for the given intent.
 */
export function getReviewStep(intent: RegisterIntent | null): number {
  return intent === 'BUYER' ? STEP_REVIEW_BUYER : STEP_REVIEW_SELLER;
}

// ============================================================
// HOOK
// ============================================================

export function useRegisterWizard() {
  const searchParams = useSearchParams();
  const [cameFromBuilder, setCameFromBuilder] = useState(false);

  const [state, setState] = useState<WizardState>(() => {
    const base: WizardState = {
      currentStep: STEP_INTENT,
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

    // Builder pre-fill → default intent SELLER, skip to account or category
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

  // Read agreement bridge (browser only)
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

  /**
   * Select intent — also resets step to STEP_INTENT+1 if intent changes
   * to avoid stale step position.
   */
  const selectIntent = (intent: RegisterIntent) => {
    setState((prev) => ({
      ...prev,
      intent,
      // If buyer, skip directly to account; else go to category
      currentStep: STEP_INTENT,
    }));
  };

  const nextStep = () => {
    const total = getTotalSteps(state.intent);
    const intent = state.intent;

    setState((prev) => {
      const next = prev.currentStep + 1;

      // BUYER skips category + storeInfo
      if (intent === 'BUYER' && prev.currentStep === STEP_INTENT) {
        return { ...prev, currentStep: STEP_ACCOUNT_BUYER };
      }

      if (next <= total + 1) {
        return { ...prev, currentStep: next };
      }
      return prev;
    });
  };

  const prevStep = () => {
    const intent = state.intent;

    setState((prev) => {
      // BUYER going back from account → back to intent
      if (intent === 'BUYER' && prev.currentStep === STEP_ACCOUNT_BUYER) {
        return { ...prev, currentStep: STEP_INTENT };
      }

      if (prev.currentStep > 1) {
        return { ...prev, currentStep: prev.currentStep - 1 };
      }
      return prev;
    });
  };

  const goToStep = (step: number) => {
    const total = getTotalSteps(state.intent);
    if (step >= 1 && step <= total + 1) {
      setState((prev) => ({ ...prev, currentStep: step }));
    }
  };

  const reset = () => {
    setState({
      currentStep: STEP_INTENT,
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
    try {
      sessionStorage.removeItem(AGREEMENT_BRIDGE_KEY);
    } catch {
      // ignore
    }
  };

  const totalSteps = getTotalSteps(state.intent);
  const isLastStep = state.intent === 'BUYER'
    ? state.currentStep === STEP_REVIEW_BUYER
    : state.currentStep === STEP_REVIEW_SELLER;

  return {
    state,
    updateState,
    selectIntent,
    nextStep,
    prevStep,
    goToStep,
    reset,
    totalSteps,
    isFirstStep: state.currentStep === 1,
    isLastStep,
    cameFromBuilder,
    // Helpers for consumers
    STEP_INTENT,
    STEP_CATEGORY,
    STEP_STORE_INFO,
    getAccountStep,
    getReviewStep,
  };
}
