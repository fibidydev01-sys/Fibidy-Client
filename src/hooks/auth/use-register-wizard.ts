'use client';

// ==========================================
// USE REGISTER WIZARD
// File: src/hooks/auth/use-register-wizard.ts
//
// Phase 3 (Interactive Store Builder, May 2026):
//
// New behavior: when arriving from /register?slug=...&category=...&agreement=accepted
// (handoff from marketing builder), the wizard:
//
//   1. Pre-fills `state.slug` from query
//   2. Pre-fills `state.category` from query (when valid + present)
//   3. Auto-derives `state.name` from slug (Q5+N1)
//      e.g. "kopi-nusantara" → "Kopi Nusantara"
//      User can navigate back to step 3 to edit if they want.
//   4. Skips Welcome (W1) — visitor already saw the marketing builder
//   5. Skips Category (when category param valid)
//   6. Skips StoreInfo (when slug + name pre-filled)
//   7. Lands on step 4 (Account) — the only step that genuinely needs input
//   8. Surfaces `cameFromBuilder` flag so step-review can pre-tick
//      the agreement checkbox per Q8 = L1 + R1
//
// Edge cases handled:
//   - Invalid slug format from query → ignored (lands on step 1 normally)
//   - Reserved slug from query → ignored (defense in depth — builder local
//     check should prevent this)
//   - Category param missing or "other"/null → category step NOT skipped
//   - Agreement acceptance: TWO sources, either qualifies as "from builder":
//       a) Query string ?agreement=accepted
//       b) sessionStorage 'fibidy_builder_agreement' === '1'
//     Defense in depth — query survives sessionStorage clearing in private
//     tabs; sessionStorage survives URL rewrites/redirects.
//
// SSR safety: useSearchParams returns null on server first render in some
// configurations. We guard accordingly. sessionStorage only touched inside
// useEffect (browser-only).
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

// Step indices (1-based to match existing register.tsx logic):
//   1 = Welcome
//   2 = Category
//   3 = StoreInfo
//   4 = Account
//   5 = Review
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

/**
 * Auto-derive a display name from a slug.
 * "kopi-nusantara" → "Kopi Nusantara"
 *
 * Used when handing off from marketing builder (which doesn't collect
 * name) so step 4 can submit successfully without forcing the user
 * back to step 3.
 */
function deriveNameFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Sanitize a query-string slug. Returns the slug if it passes ALL
 * validation (length, format, not reserved) — otherwise null.
 */
function sanitizeSlugFromQuery(raw: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.toLowerCase().trim();
  if (cleaned.length === 0 || cleaned.length > SLUG_MAX_LENGTH) return null;
  if (!validateSlugFormat(cleaned).valid) return null;
  if (isReservedSubdomain(cleaned)) return null;
  return cleaned;
}

/**
 * Validate a category key from query against the real category registry.
 * Returns the key if it exists, otherwise null.
 */
function sanitizeCategoryFromQuery(raw: string | null): string | null {
  if (!raw) return null;
  return getCategoryConfig(raw) ? raw : null;
}

// ==========================================
// HOOK
// ==========================================

export function useRegisterWizard() {
  const searchParams = useSearchParams();

  // Tracks whether the user arrived from marketing builder. Used by
  // step-review.tsx to pre-tick the agreement checkbox (R1).
  const [cameFromBuilder, setCameFromBuilder] = useState(false);

  // ── Initial state (computed lazily once on mount) ───────────────
  // useState's initializer runs ONLY on first mount, which is exactly
  // the lifecycle we want for query-param handoff.
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

    // Slug present + valid → at minimum we can pre-fill slug + name and
    // skip Welcome. Category presence determines whether we ALSO skip
    // Category step.
    const name = deriveNameFromSlug(slug);

    if (category) {
      // Best case: both slug + category present → skip 3 steps, land on Account
      return {
        ...base,
        slug,
        name,
        category,
        currentStep: STEP_ACCOUNT,
      };
    }

    // Slug only (e.g. user picked "Lainnya..." in the builder, which
    // doesn't pass category param) → skip Welcome only, land on Category
    // so they can pick the actual subcat. Slug + name still pre-filled
    // so step 3 (StoreInfo) feels prepared when they reach it.
    return {
      ...base,
      slug,
      name,
      currentStep: STEP_CATEGORY,
    };
  });

  // ── Read agreement bridge (browser only) ────────────────────────
  // Either query param or sessionStorage qualifies as "from builder".
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

  // ── State mutators ──────────────────────────────────────────────
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

    /**
     * True when the user arrived from the marketing Interactive Store Builder
     * (either via ?agreement=accepted query OR sessionStorage bridge).
     * Used by step-review.tsx to pre-tick the agreement checkbox (R1).
     */
    cameFromBuilder,
  };
}
