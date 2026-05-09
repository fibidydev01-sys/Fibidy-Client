// ==========================================
// HERO EYEBROW PILL (animated gradient border)
// File: src/components/marketing/sections/hero/eyebrow-pill.tsx
//
// [PHASE 7 SPLIT — May 2026]
// Extracted from src/components/marketing/sections/hero/index.tsx
// (was inline JSX inside the v9+v10 hero composer). Behavior
// preserved verbatim. Only path changed.
//
// ──────────────────────────────────────────────────────────────────
//
// Mirrors the canonical Magic UI animated-gradient-text DEMO exactly:
//   - rounded-full chrome with inset glow shadow
//   - Animated gradient border via CSS masking (orange → purple,
//     #ffaa40 / #9c40ff stops)
//   - Lucide <Rocket> icon (replaces the demo's 🎉 emoji for full
//     Tailwind color control + no platform rendering surprises)
//   - Vertical neutral-500 divider
//   - AnimatedGradientText span (text gradient cycles)
//   - ChevronRight with hover translate-x-0.5
//
// SERVER COMPONENT — pure CSS animation (animate-gradient class
// drives the gradient stop position via @keyframes). No JS hooks
// needed; the underlying AnimatedGradientText component itself is
// also CSS-only.
//
// PROPS:
//   - label: pre-translated eyebrow text from getTranslations()
//     in the parent server composer
// ==========================================

import { ChevronRight, Rocket } from 'lucide-react';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { cn } from '@/lib/shared/utils';

interface EyebrowPillProps {
  label: string;
}

export function EyebrowPill({ label }: EyebrowPillProps) {
  return (
    <div className="group relative inline-flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]">
      {/*
        Animated masked-border layer.
        The mask trick:
          - Outer span fills with orange→purple gradient
          - Two layered linear-gradients via webkit-mask + mask-composite
            cut a 1px ring out of it, leaving only a hairline border
          - animate-gradient class slides the gradient horizontally
        The result is a gradient border that animates, with no
        background painting on the pill body itself.
      */}
      <span
        className={cn(
          'animate-gradient absolute inset-0 block h-full w-full rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]',
        )}
        style={{
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'destination-out',
          mask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'subtract',
          WebkitClipPath: 'padding-box',
        }}
      />

      <Rocket
        className="size-4 text-neutral-700 dark:text-neutral-300"
        aria-hidden
      />
      <hr className="mx-2 h-4 w-px shrink-0 bg-neutral-500" />
      <AnimatedGradientText className="text-sm font-medium">
        {label}
      </AnimatedGradientText>
      <ChevronRight
        className="ml-1 size-4 stroke-neutral-500 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5"
        aria-hidden
      />
    </div>
  );
}
