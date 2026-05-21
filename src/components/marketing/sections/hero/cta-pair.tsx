'use client';

// ==========================================
// HERO CTA PAIR (primary RainbowButton + secondary outline)
// File: src/components/marketing/sections/hero/cta-pair.tsx
//
// [PHASE 7 SPLIT — May 2026]
// Extracted from src/components/marketing/sections/hero/index.tsx
// (was the inline CTA buttons block in the v10 hero). Behavior
// preserved verbatim.
//
// ──────────────────────────────────────────────────────────────────
//
// Two CTAs:
//   - PRIMARY: RainbowButton via onClick + router.push (programmatic
//     navigation). RainbowButton doesn't expose asChild, so we route
//     imperatively. Loses Link's prefetch but keeps the markup clean
//     (no <a><button> nesting).
//   - SECONDARY: Outline button with `asChild` wrapping a plain <a>
//     for same-page anchor (#store-builder). Lenis (mounted in the
//     marketing layout) handles smooth scroll, scroll-mt-20 on
//     SectionShell handles sticky-header offset.
//
// CLIENT REQUIREMENT:
//   - useRouter from next-intl/navigation is a client-only hook
//   - onClick handler can only attach in client component
//
// PROPS:
//   - primaryLabel: pre-translated CTA text
//   - secondaryLabel: pre-translated secondary CTA text
//   - primaryHref: target route for primary CTA (locale-aware)
//   - secondaryHref: target anchor or path for secondary CTA
//
// [BORDER FIX — May 2026]
// Secondary button border diperkuat dari `border-input` (hampir
// invisible di light mode) ke `border-2 border-foreground/30`.
// Alasan: `border-input` = oklch(0.922 0.01 340) → putih pucat di
// background putih. `border-foreground/30` jauh lebih visible di
// light maupun dark mode karena mengikuti foreground token.
// ==========================================

import { ArrowRight } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';

interface CtaPairProps {
  primaryLabel: string;
  secondaryLabel: string;
  primaryHref: string;
  secondaryHref: string;
}

export function CtaPair({
  primaryLabel,
  secondaryLabel,
  primaryHref,
  secondaryHref,
}: CtaPairProps) {
  const router = useRouter();

  return (
    <>
      <RainbowButton
        className="group h-11 min-w-[200px] text-sm font-semibold"
        onClick={() => router.push(primaryHref)}
      >
        {primaryLabel}
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
        {/*
          Plain <a> for same-page anchor. Lenis (mounted in marketing
          layout) handles smooth scroll, scroll-mt-20 on SectionShell
          handles sticky-header offset.
        */}
        <a href={secondaryHref}>{secondaryLabel}</a>
      </Button>
    </>
  );
}