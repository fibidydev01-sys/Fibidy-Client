'use client';

// ==========================================
// STORE BUILDER SECTION
// File: src/components/marketing/sections/store-builder-section.tsx
//
// Phase 5 polish v4 (May 2026 — non-interactive onboarding):
//
// CHANGED in v4:
//   - handleCategoryGuidance() now fires the tour AND schedules an
//     auto-dismiss after 2 seconds. Drops the user-clicks-Show-me
//     interaction model from v3.
//   - Re-entry guard: if the tour is already visible (e.g. user
//     hammers the input), additional fires are no-ops to avoid
//     stacking timers / overlay flashing.
//   - SubdomainInput's onCategoryRequested now fires automatically
//     on every threshold-breach attempt (no toast action button to
//     click) — see subdomain-input.tsx v4 header.
//
// PRESERVED from v3:
//   - useNextStep() hook for tour control
//   - useEffect that closes the tour when categoryId becomes non-null
//   - CategoryPicker carries id="builder-category-picker" internally
//
// All Phase 3 + 5 v1/v2 invariants preserved: bridge URL contract,
// sessionStorage `fibidy_builder_agreement` write, sticky CTA on
// mobile, BrowserMockup wrap on the preview.
// ==========================================

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useNextStep } from 'nextstepjs';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { SectionShell } from '@/components/marketing/shared/section-shell';
import { SectionEyebrow } from '@/components/marketing/shared/section-eyebrow';
import { BrowserMockup } from '@/components/marketing/shared/browser-mockup';
import { CategoryPicker } from '@/components/marketing/store-builder/category-picker';
import {
  SubdomainInput,
  type SubdomainStatus,
} from '@/components/marketing/store-builder/subdomain-input';
import { SubdomainSuggestions } from '@/components/marketing/store-builder/subdomain-suggestions';
import { BuilderPreview } from '@/components/marketing/store-builder/builder-preview';
import { builderCategories } from '@/lib/data/marketing/store-builder';
import { MARKETING_TOUR_NAMES } from '@/lib/data/marketing/tours';
import { cn } from '@/lib/shared/utils';

const AGREEMENT_BRIDGE_KEY = 'fibidy_builder_agreement';

/** How long the auto-dismissing tour spotlight stays visible. */
const TOUR_AUTO_CLOSE_MS = 2000;

export function StoreBuilderSection() {
  const t = useTranslations('marketing.storeBuilder');
  const router = useRouter();

  // ── NextStep tour control ───────────────────────────────────────
  const { startNextStep, closeNextStep, isNextStepVisible } = useNextStep();

  // ── State ───────────────────────────────────────────────────────
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>('');
  const [slugStatus, setSlugStatus] = useState<SubdomainStatus>({
    kind: 'idle',
  });
  const [agreed, setAgreed] = useState<boolean>(false);

  // ── Refs ────────────────────────────────────────────────────────
  const inlineCtaRef = useRef<HTMLDivElement | null>(null);
  /** Tracks the auto-close timer so we can clear it on re-fire / unmount. */
  const tourCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showStickyCta, setShowStickyCta] = useState(false);

  // ── Sticky CTA visibility (mobile) ──────────────────────────────
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

  // ── Auto-fire onboarding spotlight ──────────────────────────────
  // v4: invoked automatically by SubdomainInput on every
  // threshold-breach attempt (no user click). Re-entry is guarded —
  // if a tour is already visible we no-op to avoid timer stacking
  // and overlay flicker.
  const handleCategoryGuidance = () => {
    if (isNextStepVisible) return;
    if (tourCloseTimerRef.current) {
      // Defensive: clear any orphaned timer (shouldn't happen given
      // the isNextStepVisible guard, but cheap insurance).
      clearTimeout(tourCloseTimerRef.current);
      tourCloseTimerRef.current = null;
    }

    startNextStep(MARKETING_TOUR_NAMES.CATEGORY_GATE);

    // Auto-dismiss — flash spotlight, no interaction needed
    tourCloseTimerRef.current = setTimeout(() => {
      closeNextStep();
      tourCloseTimerRef.current = null;
    }, TOUR_AUTO_CLOSE_MS);
  };

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

  // ── Derived ─────────────────────────────────────────────────────
  const categorySelected = categoryId !== null;
  const canSubmit =
    categorySelected && slugStatus.kind === 'available' && agreed;

  const previewUrl = slug
    ? `${slug}.fibidy.com`
    : `${t('preview.placeholderSlug')}.fibidy.com`;

  // ── Submit handler ──────────────────────────────────────────────
  const handleSubmit = () => {
    if (!canSubmit || categoryId === null) return;

    const matched = builderCategories.find((c) => c.id === categoryId);
    if (!matched) return;

    try {
      sessionStorage.setItem(AGREEMENT_BRIDGE_KEY, '1');
    } catch {
      // Private tabs — query param still carries the signal
    }

    const params = new URLSearchParams();
    params.set('slug', slug);
    params.set('category', matched.categoryKey);
    params.set('agreement', 'accepted');

    router.push(`/register?${params.toString()}`);
  };

  return (
    <SectionShell id="store-builder">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <SectionEyebrow>{t('eyebrow')}</SectionEyebrow>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {t('headline')}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {t('subheadline')}
        </p>
      </div>

      {/* Two-column layout on lg+ */}
      <div className="mx-auto mt-12 grid max-w-6xl gap-8 lg:grid-cols-2 lg:gap-12">
        {/* LEFT — form column */}
        <div className="space-y-6">
          {/* CategoryPicker carries id="builder-category-picker" internally
              — that's the selector NextStep uses for the category-gate tour. */}
          <CategoryPicker
            selectedId={categoryId}
            onSelect={setCategoryId}
          />

          <SubdomainInput
            value={slug}
            onChange={setSlug}
            onStatusChange={setSlugStatus}
            categorySelected={categorySelected}
            onCategoryRequested={handleCategoryGuidance}
          />

          <SubdomainSuggestions
            takenSlug={slug}
            visible={slugStatus.kind === 'taken'}
            onPick={(s) => setSlug(s)}
          />

          {/* Agreement checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="builder-agreement"
              checked={agreed}
              onCheckedChange={(c) => setAgreed(c === true)}
              className="mt-0.5 shrink-0"
            />
            <label
              htmlFor="builder-agreement"
              className="cursor-pointer select-none text-xs leading-relaxed text-muted-foreground"
            >
              {t('agreement.prefix')}{' '}
              <a
                href="/legal/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {t('agreement.termsLink')}
              </a>{' '}
              {t('agreement.and')}{' '}
              <a
                href="/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {t('agreement.privacyLink')}
              </a>
              .
            </label>
          </div>

          {/* Inline CTA */}
          <div ref={inlineCtaRef} className="space-y-3 pt-2">
            <Button
              size="lg"
              className="group w-full sm:w-auto sm:min-w-[260px]"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {t('ctaPrimary')}
              <ArrowRight
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Button>
            <p className="text-xs text-muted-foreground">{t('trustLine')}</p>
          </div>
        </div>

        {/* RIGHT — Browser-wrapped preview, sticky on lg+ */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <BrowserMockup url={previewUrl}>
            <BuilderPreview categoryId={categoryId} slug={slug} />
          </BrowserMockup>
        </div>
      </div>

      {/* Sticky bottom CTA (mobile only) */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 py-3 backdrop-blur-md transition-transform duration-200 lg:hidden',
          'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
          showStickyCta ? 'translate-y-0' : 'translate-y-full',
        )}
        aria-hidden={!showStickyCta}
      >
        <Button
          size="lg"
          className="group w-full"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {t('ctaPrimary')}
          <ArrowRight
            className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </Button>
      </div>
    </SectionShell>
  );
}
