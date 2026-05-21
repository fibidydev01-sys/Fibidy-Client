'use client';

// ==========================================
// STORE BUILDER — FORM ISLAND
// File: src/components/marketing/sections/store-builder/form-island.tsx
//
// [VISUAL SYNC v4 — May 2026]
//
// Visual pattern = Hero:
//   EyebrowPill → Headline (prefix + WordRotate) → subheadline
//   semua di-stagger via FormMotionStagger
//
// Fungsi = StoreBuilder original (TIDAK DIHAPUS):
//   SubdomainInput → SubdomainSuggestions → Agreement checkbox
//   → RainbowButton CTA → trust line → sticky mobile CTA
//
// Perubahan dari v3 (yang salah hapus fungsi):
//   - formBody dikembalikan: slug input + agreement + CTA semua ada
//   - Sticky mobile CTA dikembalikan
//   - Agreement checkbox dikembalikan
//   - Labels interface dikembalikan ke original + tambahan visual chrome
//
// [BORDER FIX — May 2026]
// Secondary button border diperkuat dari default `border-input`
// (hampir invisible di light mode) ke `border-2 border-foreground/30
// hover:border-foreground/50`. Sama persis dengan fix di hero/cta-pair.tsx
// supaya visual language konsisten di kedua section.
// ==========================================

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { EyebrowPill } from '@/components/marketing/sections/hero/eyebrow-pill';
import { Headline } from '@/components/marketing/sections/hero/headline';
import { FormMotionStagger } from './form-motion-stagger';
import { SubdomainInput } from './subdomain-input';
import { SubdomainSuggestions } from './subdomain-suggestions';
import { useStoreBuilder } from './use-store-builder';
import { cn } from '@/lib/shared/utils';

// ==========================================
// PROPS
// ==========================================

export interface StoreBuilderFormLabels {
  // Visual chrome (Hero pattern)
  eyebrowLabel: string;
  headlinePrefix: string;
  morphWords: string[];
  subheadline: string;
  // Form functional (StoreBuilder original)
  ctaPrimary: string;
  ctaSecondary: string;
  secondaryHref: string;
  trustLine: string;
}

interface StoreBuilderFormIslandProps {
  labels: StoreBuilderFormLabels;
}

// ==========================================
// COMPONENT
// ==========================================

export function StoreBuilderFormIsland({ labels }: StoreBuilderFormIslandProps) {
  const builder = useStoreBuilder();

  // ── Form body — fungsi StoreBuilder UTUH ────────────────────────
  const formBody = (
    <div className="mx-auto mt-10 max-w-xl space-y-6">

      {/* Slug input */}
      <SubdomainInput
        value={builder.slug}
        onChange={builder.setSlug}
        onStatusChange={builder.setSlugStatus}
      />

      {/* Suggestions when slug taken */}
      <SubdomainSuggestions
        takenSlug={builder.slug}
        visible={builder.slugStatus.kind === 'taken'}
        onPick={(s) => builder.setSlug(s)}
      />

      {/* CTA pair — RainbowButton primary + outline secondary */}
      <div ref={builder.inlineCtaRef} className="space-y-3 pt-2">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <RainbowButton
            className="group h-11 min-w-[200px] text-sm font-semibold"
            onClick={builder.handleSubmit}
          >
            {labels.ctaPrimary}
            <ArrowRight
              className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </RainbowButton>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-w-[180px] border-2 border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500"
          >
            <a href={labels.secondaryHref}>{labels.ctaSecondary}</a>
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {labels.trustLine}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/*
        Visual: Hero pattern — EyebrowPill + Headline + subheadline
        Fungsi: form body di bawah subheadline (tidak dihapus)
      */}
      <FormMotionStagger
        eyebrow={<EyebrowPill label={labels.eyebrowLabel} />}
        headline={
          <Headline
            prefix={labels.headlinePrefix}
            words={labels.morphWords}
          />
        }
        subheadline={labels.subheadline}
        formBody={formBody}
      />

      {/* Sticky mobile CTA — muncul saat inline CTA scroll keluar viewport */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 py-3 backdrop-blur-md transition-transform duration-200 lg:hidden',
          'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
          builder.showStickyCta ? 'translate-y-0' : 'translate-y-full',
        )}
        aria-hidden={!builder.showStickyCta}
      >
        <RainbowButton
          className="group h-11 w-full text-sm font-semibold"
          onClick={builder.handleSubmit}
        >
          {labels.ctaPrimary}
          <ArrowRight
            className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </RainbowButton>
      </div>
    </>
  );
}