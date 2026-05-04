'use client';

// ==========================================
// STORE BUILDER SECTION
// File: src/components/marketing/sections/store-builder-section.tsx
//
// Phase 3 (Interactive Store Builder, May 2026):
//
// Orchestrator for the inline "try it" experience. Composition:
//
//   ┌──────────────────────────────────────────┐
//   │ Eyebrow + H2 + subheadline               │
//   ├──────────────────────────────────────────┤
//   │ LEFT (lg):                  RIGHT (lg):  │
//   │  CategoryPicker             BuilderPreview (sticky)
//   │  SubdomainInput
//   │  SubdomainSuggestions
//   │  Agreement checkbox + links
//   │  Primary CTA
//   │  Trust line
//   └──────────────────────────────────────────┘
//
// Mobile (Q7 = M3): everything stacks vertical, CTA pinned to bottom
// once the user scrolls past the preview, hidden again when the
// CategoryPicker scrolls back into view (avoids overlap with the
// inline form on first paint).
//
// Submit flow (Q8 = L1 agreement bridge):
//   1. CTA enabled only when: category picked AND slug status='available'
//      AND agreement ticked
//   2. On click:
//        - sessionStorage.setItem('fibidy_builder_agreement', '1')
//          (Used by useRegisterWizard to pre-tick Review step)
//        - router.push(`/register?slug=...&category=...&agreement=accepted`)
//          (Defense-in-depth: if sessionStorage is cleared in a private
//          tab, the query param still propagates the bridge.)
//
// 'use client' because: useState, useEffect, useRouter, sessionStorage
// access, IntersectionObserver for sticky CTA visibility.
// ==========================================

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { SectionShell } from '@/components/marketing/shared/section-shell';
import { SectionEyebrow } from '@/components/marketing/shared/section-eyebrow';
import { CategoryPicker } from '@/components/marketing/store-builder/category-picker';
import {
  SubdomainInput,
  type SubdomainStatus,
} from '@/components/marketing/store-builder/subdomain-input';
import { SubdomainSuggestions } from '@/components/marketing/store-builder/subdomain-suggestions';
import { BuilderPreview } from '@/components/marketing/store-builder/builder-preview';
import { builderCategories } from '@/lib/data/marketing/store-builder';
import { cn } from '@/lib/shared/utils';

// SessionStorage key used by useRegisterWizard to pre-tick Review agreement
const AGREEMENT_BRIDGE_KEY = 'fibidy_builder_agreement';

export function StoreBuilderSection() {
  const t = useTranslations('marketing.storeBuilder');
  const router = useRouter();

  // ── State ───────────────────────────────────────────────────────
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>('');
  const [slugStatus, setSlugStatus] = useState<SubdomainStatus>({
    kind: 'idle',
  });
  const [agreed, setAgreed] = useState<boolean>(false);

  // ── Sticky CTA visibility (mobile, Q7=M3) ───────────────────────
  // CTA pinned to bottom appears AFTER user scrolls past the
  // CategoryPicker section anchor. Hides again when category-picker
  // re-enters viewport (so it doesn't double up with the inline CTA).
  const inlineCtaRef = useRef<HTMLDivElement | null>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const target = inlineCtaRef.current;
    if (!target) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        // Show sticky CTA when the inline CTA is OFFSCREEN below
        // (i.e. user scrolled past it on mobile)
        setShowStickyCta(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, []);

  // ── Derived: can we submit? ─────────────────────────────────────
  const canSubmit =
    categoryId !== null && slugStatus.kind === 'available' && agreed;

  // ── Submit handler ──────────────────────────────────────────────
  const handleSubmit = () => {
    if (!canSubmit || categoryId === null) return;

    const matched = builderCategories.find((c) => c.id === categoryId);
    // matched.categoryKey === null for "Other" → don't pass category param,
    // register lands at step 2 (Category) instead of skipping it.
    const categoryParam = matched?.categoryKey ?? null;

    // Bridge agreement via sessionStorage AND query param (defense in depth)
    try {
      sessionStorage.setItem(AGREEMENT_BRIDGE_KEY, '1');
    } catch {
      // Private tabs can throw — query param still carries the signal
    }

    const params = new URLSearchParams();
    params.set('slug', slug);
    if (categoryParam) params.set('category', categoryParam);
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
          <CategoryPicker selectedId={categoryId} onSelect={setCategoryId} />

          <SubdomainInput
            value={slug}
            onChange={setSlug}
            onStatusChange={setSlugStatus}
          />

          <SubdomainSuggestions
            takenSlug={slug}
            visible={slugStatus.kind === 'taken'}
            onPick={(s) => setSlug(s)}
          />

          {/* Agreement checkbox (Q8 = L1) */}
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

          {/* Inline CTA (always rendered) */}
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

        {/* RIGHT — sticky preview on lg+ */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <BuilderPreview categoryId={categoryId} slug={slug} />
        </div>
      </div>

      {/* Sticky bottom CTA (mobile only, Q7 = M3) */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 py-3 backdrop-blur-md transition-transform duration-200 lg:hidden',
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
