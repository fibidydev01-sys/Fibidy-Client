'use client';

// ==========================================
// USE REGISTER WIZARD
// File: src/hooks/auth/use-register-wizard.ts
//
// Phase 3 (Interactive Store Builder, May 2026):
//
// Auto-skip behavior on arrival from /register?slug=...&category=...
// from the marketing builder. Pre-fills slug + category, auto-derives
// name, lands on Account step (4).
//
// Phase 5 (Magic UI polish, May 2026 — CEO unlock):
//
// CHANGED:
//   - "Other" escape hatch in the marketing builder REMOVED. Every
//     category from the query string now resolves to a real registry
//     key (validated upstream at module-load time in store-builder.ts).
//   - Hook still defensively validates the category param (defense in
//     depth — query params can be hand-edited). If validation fails,
//     falls back to landing on Category step instead of Account.
//   - Behavior on slug-only (no category) query is preserved — was
//     used for the legacy "Other" path, but a hand-crafted URL might
//     still hit it, so the path stays.
//
// Edge cases handled:
//   - Invalid slug format from query → ignored (lands on step 1 normally)
//   - Reserved slug from query → ignored
//   - Invalid category param → ignored, lands on Category step
//   - Agreement acceptance: TWO sources, either qualifies as "from builder":
//       a) Query string ?agreement=accepted
//       b) sessionStorage 'fibidy_builder_agreement' === '1'
// ==========================================

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { RegisterFormData } from '@/lib/shared/validations';
import {
  validateSlugFormat,
  SLUG_MAX_LENGTH,
} from '@/lib/constants/shared/slug.constants';
import { isReservedSubdomain } from '@/lib/constants/shared/reserved-subdomains';
import { getCategoryConfig } from '@/lib/constants/shared/categories';

// ==========================================
// CONSTANTS
// ==========================================

const TOTAL_STEPS = 5;
const AGREEMENT_BRIDGE_KEY = 'fibidy_builder_agreement';

const STEP_WELCOME = 1;
const STEP_CATEGORY = 2;
const STEP_STORE_INFO = 3;
const STEP_ACCOUNT = 4;

// ==========================================
// TYPES
// ==========================================

interface WizardState extends Partial<RegisterFormData> {
  currentStep: number;
}

// ==========================================
// HELPERS — pure
// ==========================================

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

// ==========================================
// HOOK
// ==========================================

export function useRegisterWizard() {
  const searchParams = useSearchParams();
  const [cameFromBuilder, setCameFromBuilder] = useState(false);

  // Initial state computed lazily once on mount
  const [state, setState] = useState<WizardState>(() => {
    const base: WizardState = {
      currentStep: STEP_WELCOME,
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

    // No usable slug → render normally from step 1.
    if (!slug) return base;

    const name = deriveNameFromSlug(slug);

    if (category) {
      // Best case: both slug + category present → skip to Account
      return {
        ...base,
        slug,
        name,
        category,
        currentStep: STEP_ACCOUNT,
      };
    }

    // Slug only (rare in Phase 5 — every chip carries a category, so
    // this only happens with hand-crafted URLs). Land on Category step.
    return {
      ...base,
      slug,
      name,
      currentStep: STEP_CATEGORY,
    };
  });

  // Read agreement bridge (browser only)
  useEffect(() => {
    if (!searchParams) return;

    const queryAgreement = searchParams.get('agreement') === 'accepted';

    let storageAgreement = false;
    try {
      storageAgreement =
        sessionStorage.getItem(AGREEMENT_BRIDGE_KEY) === '1';
    } catch {
      // Private tab or storage disabled — query is the fallback
    }

    setCameFromBuilder(queryAgreement || storageAgreement);
  }, [searchParams]);

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
      currentStep: STEP_WELCOME,
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
    cameFromBuilder,
  };
}
