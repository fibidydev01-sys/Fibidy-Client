'use client';

// ==========================================
// USE STORE BUILDER (custom hook)
// File: src/components/marketing/sections/store-builder/use-store-builder.ts
//
// [PHASE 1 SLIM — May 2026 — category + preview removed]
//
// CHANGED:
//   - CategoryPicker removed from the builder. ALL category state and
//     side effects are gone:
//       * categoryId / setCategoryId
//       * handleCategorySelect (incl. the "Lainnya"/"Other" → /register
//         escape hatch)
//       * handleCategoryGuidance
//       * categorySelected derived flag
//       * NextStep tour wiring (useNextStep, MARKETING_TOURS,
//         startNextStep/closeNextStep, auto-close timer, tourCloseTimerRef)
//   - The builder is now a pure SLUG CLAIM. canSubmit gates only on
//     slug availability + agreement.
//   - Bridge URL no longer carries `category`:
//       BEFORE: /register?slug=X&category=Y&agreement=accepted
//       AFTER:  /register?slug=X&agreement=accepted
//     The register wizard already handles a slug-only arrival — it
//     lands the user on the Category step (Step 2) to pick there.
//     (See use-register-wizard.ts: slug-without-category path.)
//
// PRESERVED:
//   - Sticky CTA IntersectionObserver (mobile)
//   - sessionStorage 'fibidy_builder_agreement' = '1' bridge
//   - useRouter from '@/i18n/navigation' (locale-aware)
//   - Reserved-subdomain + slug-format checks live in SubdomainInput;
//     this hook only owns the claim/submit flow.
//   - SSR safety: sessionStorage only touched inside handleSubmit
//     (event handler); IntersectionObserver only inside useEffect.
//
// WHAT THIS HOOK NO LONGER KNOWS ABOUT:
//   - lib/marketing/data/store-builder.ts (builderCategories)
//   - nextstepjs / MARKETING_TOURS
//   The marketing tour provider may still be mounted at the layout,
//   but nothing here triggers it anymore. That's intentional for the
//   phased cleanup — no error, the tour simply never fires.
// ==========================================

import { useEffect, useRef, useState } from 'react';
import { useRouter } from '@/i18n/navigation';

import type { SubdomainStatus } from './subdomain-input';

// ==========================================
// CONSTANTS
// ==========================================

/** sessionStorage key — read by step-review.tsx on /register page */
const AGREEMENT_BRIDGE_KEY = 'fibidy_builder_agreement';

// ==========================================
// RESULT INTERFACE
// ==========================================

export interface UseStoreBuilderResult {
  // ── State ──────────────────────────────────────────────────────
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
  handleSubmit: () => void;

  // ── Derived state ─────────────────────────────────────────────
  canSubmit: boolean;
  /** Slug to display in the BrowserMockup URL bar; falls back to placeholder */
  previewSlug: string;
}

// ==========================================
// HOOK
// ==========================================

/**
 * Owns the slug-claim flow for the (slimmed) store-builder section.
 * Returns state, setters, the inline-CTA ref (for sticky-CTA
 * visibility), the submit handler, and derived flags.
 */
export function useStoreBuilder(): UseStoreBuilderResult {
  const router = useRouter();

  // ── State ───────────────────────────────────────────────────────
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

  // ── Derived ─────────────────────────────────────────────────────
  // No category gate anymore — availability + agreement is the whole bar.
  const canSubmit = slugStatus.kind === 'available' && agreed;

  // BrowserMockup URL bar fallback: empty slug → consumer (form-island)
  // resolves its own translated placeholder. We return the raw slug only.
  const previewSlug = slug;

  // ── Submit handler ──────────────────────────────────────────────
  // Buttons are not DOM-disabled (intentional — visual cue only).
  // This guard is the sole gate. Clicks while invalid are silent
  // no-ops.
  const handleSubmit = () => {
    if (!canSubmit) return;

    try {
      sessionStorage.setItem(AGREEMENT_BRIDGE_KEY, '1');
    } catch {
      // Private tabs / storage disabled — query param still carries
      // the signal, hook downstream still receives agreement=accepted
    }

    const params = new URLSearchParams();
    params.set('slug', slug);
    params.set('agreement', 'accepted');

    router.push(`/register?${params.toString()}`);
  };

  return {
    // State
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
    handleSubmit,

    // Derived
    canSubmit,
    previewSlug,
  };
}