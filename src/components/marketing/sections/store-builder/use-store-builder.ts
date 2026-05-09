'use client';

// ==========================================
// USE STORE BUILDER (custom hook)
// File: src/components/marketing/sections/store-builder/use-store-builder.ts
//
// Phase 8 (May 2026 — section orchestration extraction):
//
// Pure logic hook for the store-builder form. Owns ALL side effects
// previously tangled into the section component:
//   - Form state: categoryId, slug, slugStatus, agreed
//   - Sticky CTA observer (mobile)
//   - NextStep tour trigger + auto-dismiss timer
//   - Auto-close tour when category gets picked
//   - "Lainnya" / "Other" escape-hatch interception → /register
//   - Bridge contract: sessionStorage 'fibidy_builder_agreement' = '1'
//   - Bridge contract: /register?slug=X&category=Y&agreement=accepted
//
// Why a hook (not utility functions):
//   - State is co-dependent (category pick → close tour effect)
//   - useEffect lifecycle ties (sticky CTA observer, tour cleanup)
//   - Testable in isolation via @testing-library/react-hooks
//
// PRESERVED INVARIANTS (DO NOT TOUCH):
//   - Q17 SoT guard lives in lib/data/marketing/store-builder.ts
//     (module-load validation; this file imports the validated array
//     and never re-validates)
//   - Bridge URL contract: /register?slug=X&category=Y&agreement=accepted
//     three params, exact names, exact format
//   - sessionStorage key 'fibidy_builder_agreement' = '1' (string, not bool)
//   - TOUR_AUTO_CLOSE_MS = 2000 (auto-dismiss timing)
//   - useRouter from '@/i18n/navigation' (locale-aware, NOT next/navigation)
//   - Reserved subdomains check + slug regex sourced from BE-mirrored constants
//
// SSR SAFETY:
//   - sessionStorage access wrapped in try/catch + only fires inside
//     handleSubmit (event handler — client-only by definition)
//   - IntersectionObserver setup runs inside useEffect (client-only)
//   - No window/document access at module scope
//
// i18n NOT in this hook:
//   The hook is pure logic — no useTranslations, no t() calls. Toast
//   strings, label strings, etc. are passed by the form-island as
//   needed (toast strings actually live inside SubdomainInput which
//   has its own useTranslations). The hook returns refs and handlers
//   only.
// ==========================================

import { useEffect, useRef, useState } from 'react';
import { useNextStep } from 'nextstepjs';
import { useRouter } from '@/i18n/navigation';

import { builderCategories } from '@/lib/marketing/data/store-builder';
import { MARKETING_TOURS } from '@/lib/marketing/onboarding/tour-names';
import type { SubdomainStatus } from './subdomain-input';

// ==========================================
// CONSTANTS
// ==========================================

/** sessionStorage key — read by step-review.tsx on /register page */
const AGREEMENT_BRIDGE_KEY = 'fibidy_builder_agreement';

/** How long the auto-dismissing tour spotlight stays visible (ms). */
export const TOUR_AUTO_CLOSE_MS = 2000;

// ==========================================
// RESULT INTERFACE
// ==========================================

export interface UseStoreBuilderResult {
  // ── State ──────────────────────────────────────────────────────
  categoryId: string | null;
  slug: string;
  slugStatus: SubdomainStatus;
  agreed: boolean;
  showStickyCta: boolean;

  // ── Setters (passed through to sub-components) ────────────────
  setSlug: (next: string) => void;
  setSlugStatus: (status: SubdomainStatus) => void;
  setAgreed: (next: boolean) => void;

  // ── Refs ──────────────────────────────────────────────────────
  /** Attached to the inline CTA wrapper for IntersectionObserver */
  inlineCtaRef: React.RefObject<HTMLDivElement | null>;

  // ── Handlers ──────────────────────────────────────────────────
  handleCategorySelect: (id: string) => void;
  handleCategoryGuidance: () => void;
  handleSubmit: () => void;

  // ── Derived state ─────────────────────────────────────────────
  categorySelected: boolean;
  canSubmit: boolean;
  /** Slug to display in the BrowserMockup URL bar; falls back to placeholder */
  previewSlug: string;
}

// ==========================================
// HOOK
// ==========================================

/**
 * Owns the entire form-orchestration concern for the store-builder
 * section. Returns state, setters, refs, handlers, and derived flags.
 *
 * Consumers (form-island.tsx) wire the returned values into the
 * sub-components (CategoryPicker, SubdomainInput, etc.) and into the
 * inline + sticky CTAs.
 */
export function useStoreBuilder(): UseStoreBuilderResult {
  const router = useRouter();
  const { startNextStep, closeNextStep, isNextStepVisible } = useNextStep();

  // ── State ───────────────────────────────────────────────────────
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>('');
  const [slugStatus, setSlugStatus] = useState<SubdomainStatus>({
    kind: 'idle',
  });
  // Pre-checked. Legally acceptable for ID-only deployment.
  // Revisit if EU/UK markets are added — pre-checked consent invalid
  // under GDPR Art. 4(11) (CJEU Planet49, 2019).
  const [agreed, setAgreed] = useState<boolean>(true);
  const [showStickyCta, setShowStickyCta] = useState(false);

  // ── Refs ────────────────────────────────────────────────────────
  const inlineCtaRef = useRef<HTMLDivElement | null>(null);
  /** Tracks the auto-close timer so we can clear it on re-fire / unmount. */
  const tourCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sticky CTA visibility (mobile) ──────────────────────────────
  // When the inline CTA scrolls out of view (above the viewport), the
  // sticky bottom CTA fades in. IntersectionObserver is browser-only,
  // so it only fires after mount (no SSR concern).
  useEffect(() => {
    const target = inlineCtaRef.current;
    if (!target) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        setShowStickyCta(
          !entry.isIntersecting && entry.boundingClientRect.top < 0,
        );
      },
      { threshold: 0 },
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, []);

  // ── Cleanup pending tour timer on unmount ───────────────────────
  useEffect(() => {
    return () => {
      if (tourCloseTimerRef.current) {
        clearTimeout(tourCloseTimerRef.current);
        tourCloseTimerRef.current = null;
      }
    };
  }, []);

  // ── Auto-close tour the moment a category is picked ─────────────
  // Even if the auto-dismiss timer hasn't fired yet, picking a
  // category renders the tour pointless — close immediately and
  // cancel the pending timer.
  useEffect(() => {
    if (categoryId !== null && isNextStepVisible) {
      closeNextStep();
      if (tourCloseTimerRef.current) {
        clearTimeout(tourCloseTimerRef.current);
        tourCloseTimerRef.current = null;
      }
    }
  }, [categoryId, isNextStepVisible, closeNextStep]);

  // ── Auto-fire onboarding spotlight ──────────────────────────────
  // Invoked automatically by SubdomainInput on every threshold-breach
  // attempt (no user click). Re-entry is guarded — if a tour is
  // already visible we no-op to avoid timer stacking and overlay
  // flicker.
  const handleCategoryGuidance = () => {
    if (isNextStepVisible) return;
    if (tourCloseTimerRef.current) {
      clearTimeout(tourCloseTimerRef.current);
      tourCloseTimerRef.current = null;
    }

    startNextStep(MARKETING_TOURS.CATEGORY_PICKER);

    // Auto-dismiss — flash spotlight, no interaction needed
    tourCloseTimerRef.current = setTimeout(() => {
      closeNextStep();
      tourCloseTimerRef.current = null;
    }, TOUR_AUTO_CLOSE_MS);
  };

  // ── Category select handler ─────────────────────────────────────
  // Intercepts clicks on the "Lainnya" / "Other" chip (carries
  // `isOther: true` flag from store-builder.ts data) and bypasses
  // the entire builder flow — straight to /register, no slug-claim,
  // no agreement bridge. Wizard lands on Welcome (Step 1).
  //
  // For every other category, behavior is unchanged: state updates
  // upstream → preview refreshes → slug claim → handleSubmit pushes
  // the bridge URL with query params.
  const handleCategorySelect = (id: string) => {
    const picked = builderCategories.find((c) => c.id === id);
    if (picked?.isOther) {
      router.push('/register');
      return;
    }
    setCategoryId(id);
  };

  // ── Derived ─────────────────────────────────────────────────────
  const categorySelected = categoryId !== null;
  const canSubmit =
    categorySelected && slugStatus.kind === 'available' && agreed;

  // BrowserMockup URL bar fallback: empty slug → undefined → consumer
  // (form-island) can use its own translated placeholder. We return
  // the raw slug only; placeholder resolution is the caller's job
  // since it requires i18n (which doesn't belong in this hook).
  const previewSlug = slug;

  // ── Submit handler ──────────────────────────────────────────────
  // Buttons are not DOM-disabled (intentional — visual cue only).
  // This guard is the sole gate. Clicks while invalid are silent
  // no-ops.
  const handleSubmit = () => {
    if (!canSubmit || categoryId === null) return;

    const matched = builderCategories.find((c) => c.id === categoryId);
    if (!matched) return;

    try {
      sessionStorage.setItem(AGREEMENT_BRIDGE_KEY, '1');
    } catch {
      // Private tabs / storage disabled — query param still carries
      // the signal, hook downstream still receives agreement=accepted
    }

    const params = new URLSearchParams();
    params.set('slug', slug);
    params.set('category', matched.categoryKey);
    params.set('agreement', 'accepted');

    router.push(`/register?${params.toString()}`);
  };

  return {
    // State
    categoryId,
    slug,
    slugStatus,
    agreed,
    showStickyCta,

    // Setters
    setSlug,
    setSlugStatus,
    setAgreed,

    // Refs
    inlineCtaRef,

    // Handlers
    handleCategorySelect,
    handleCategoryGuidance,
    handleSubmit,

    // Derived
    categorySelected,
    canSubmit,
    previewSlug,
  };
}
