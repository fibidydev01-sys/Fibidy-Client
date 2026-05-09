'use client';

// ==========================================
// STORE BUILDER — FORM ISLAND
// File: src/components/marketing/sections/store-builder/form-island.tsx
//
// Phase 8 (May 2026 — section orchestration extraction):
//
// Client island that owns the entire form composition. Wraps the
// useStoreBuilder() hook and wires its state into the four
// sub-components (CategoryPicker, SubdomainInput, SubdomainSuggestions,
// BuilderPreview) plus the agreement checkbox, inline CTA, BrowserMockup,
// and sticky mobile CTA.
//
// WHY AN ISLAND, NOT JUST A HOOK IN INDEX.TSX:
//   - Allows the server composer to stay server (no 'use client' cascade)
//   - Props-based contract makes the boundary explicit
//   - Easier to swap mock data for testing (storybook, future)
//
// Props are PRE-TRANSLATED strings from the server composer. The hook
// itself doesn't take i18n; the form-island only forwards copy that
// can't be resolved via the children's own useTranslations() calls
// (i.e., the agreement checkbox text, the trust line, the CTA label).
//
// Sub-components keep their own useTranslations:
//   - CategoryPicker → 'marketing.storeBuilder.categoryStep.*'
//   - SubdomainInput → 'marketing.storeBuilder.subdomainStep.*'
//   - SubdomainSuggestions → 'marketing.storeBuilder.subdomainStep.*'
//   - BuilderPreview → 'marketing.storeBuilder.preview.*'
//
// This keeps prop surface narrow — only THIS file's own copy is
// passed in (agreement legal text, CTA label, trust line, preview
// fallback slug).
//
// PRESERVED FROM PRE-PHASE-8:
//   - 2-column lg+ layout (form left, sticky preview right)
//   - Agreement checkbox pre-checked, anchor click guarded with
//     stopPropagation so label doesn't toggle when user opens legal
//   - Inline CTA carries arrow icon with hover translate-x animation
//   - Sticky mobile CTA fades in via translate transition,
//     pb-[max(0.75rem,env(safe-area-inset-bottom))] for notched devices
//   - BrowserMockup wraps BuilderPreview with `${slug || placeholder}.fibidy.com`
// ==========================================

import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { BrowserMockup } from '@/components/marketing/primitives/browser-mockup';
import { CategoryPicker } from './category-picker';
import { SubdomainInput } from './subdomain-input';
import { SubdomainSuggestions } from './subdomain-suggestions';
import { BuilderPreview } from './builder-preview';
import { useStoreBuilder } from './use-store-builder';
import { cn } from '@/lib/shared/utils';

// ==========================================
// PROPS
// ==========================================

export interface StoreBuilderFormLabels {
  /** "I agree to the" prefix */
  agreementPrefix: string;
  /** "Terms of Service" link label */
  termsLink: string;
  /** "and" connector */
  agreementAnd: string;
  /** "Privacy Policy" link label */
  privacyLink: string;
  /** Primary CTA label (e.g. "Open your store now") */
  ctaPrimary: string;
  /** Trust line under inline CTA (e.g. "Sign up in 2 minutes · Quick and easy") */
  trustLine: string;
  /** Placeholder slug for the BrowserMockup URL bar when slug is empty */
  previewPlaceholderSlug: string;
}

interface StoreBuilderFormIslandProps {
  labels: StoreBuilderFormLabels;
}

// ==========================================
// COMPONENT
// ==========================================

export function StoreBuilderFormIsland({
  labels,
}: StoreBuilderFormIslandProps) {
  const builder = useStoreBuilder();

  const previewUrl = builder.previewSlug
    ? `${builder.previewSlug}.fibidy.com`
    : `${labels.previewPlaceholderSlug}.fibidy.com`;

  return (
    <>
      {/* Two-column layout on lg+ */}
      <div className="mx-auto mt-12 grid max-w-6xl gap-8 lg:grid-cols-2 lg:gap-12">
        {/* LEFT — form column */}
        <div className="space-y-6">
          {/* CategoryPicker carries id="builder-category-picker" internally
              — that's the selector NextStep uses for the category-gate
              tour. handleCategorySelect intercepts the "Lainnya" chip
              and redirects to /register. */}
          <CategoryPicker
            selectedId={builder.categoryId}
            onSelect={builder.handleCategorySelect}
          />

          <SubdomainInput
            value={builder.slug}
            onChange={builder.setSlug}
            onStatusChange={builder.setSlugStatus}
            categorySelected={builder.categorySelected}
            onCategoryRequested={builder.handleCategoryGuidance}
          />

          <SubdomainSuggestions
            takenSlug={builder.slug}
            visible={builder.slugStatus.kind === 'taken'}
            onPick={(s) => builder.setSlug(s)}
          />

          {/* Agreement checkbox — pre-checked */}
          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="builder-agreement"
              checked={builder.agreed}
              onCheckedChange={(c) => builder.setAgreed(c === true)}
              className="mt-0.5 shrink-0"
            />
            <label
              htmlFor="builder-agreement"
              className="cursor-pointer select-none text-xs leading-relaxed text-muted-foreground"
            >
              {labels.agreementPrefix}{' '}
              <a
                href="/legal/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {labels.termsLink}
              </a>{' '}
              {labels.agreementAnd}{' '}
              <a
                href="/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {labels.privacyLink}
              </a>
              .
            </label>
          </div>

          {/* Inline CTA — always enabled, gated only by handleSubmit */}
          <div ref={builder.inlineCtaRef} className="space-y-3 pt-2">
            <Button
              size="lg"
              className="group w-full sm:w-auto sm:min-w-[260px]"
              onClick={builder.handleSubmit}
            >
              {labels.ctaPrimary}
              <ArrowRight
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Button>
            <p className="text-xs text-muted-foreground">
              {labels.trustLine}
            </p>
          </div>
        </div>

        {/* RIGHT — Browser-wrapped preview, sticky on lg+ */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <BrowserMockup url={previewUrl}>
            <BuilderPreview
              categoryId={builder.categoryId}
              slug={builder.slug}
            />
          </BrowserMockup>
        </div>
      </div>

      {/* Sticky bottom CTA (mobile only) — always enabled */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 py-3 backdrop-blur-md transition-transform duration-200 lg:hidden',
          'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
          builder.showStickyCta ? 'translate-y-0' : 'translate-y-full',
        )}
        aria-hidden={!builder.showStickyCta}
      >
        <Button
          size="lg"
          className="group w-full"
          onClick={builder.handleSubmit}
        >
          {labels.ctaPrimary}
          <ArrowRight
            className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </Button>
      </div>
    </>
  );
}
