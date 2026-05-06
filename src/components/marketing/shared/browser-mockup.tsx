// ==========================================
// BROWSER MOCKUP
// File: src/components/marketing/shared/browser-mockup.tsx
//
// Phase 5 polish v11 (May 2026 — URL capsule matches eyebrow pill):
//
// CHANGED:
//   URL capsule now mirrors the hero eyebrow pill exactly. Same
//   structural treatment:
//     - rounded-full pill chrome
//     - animated gradient border via CSS masking (orange → purple,
//       same #ffaa40 / #9c40ff stops)
//     - inset glow shadow
//     - hover state lifting the inset shadow
//     - Lock icon + vertical divider + AnimatedGradientText
//
//   The Lock icon replaces the eyebrow's Rocket — browser-native
//   semantic (HTTPS indicator). ChevronRight is omitted because a
//   URL is informational, not a CTA. Sizing is scaled down (size-3
//   icon, h-3 divider, px-3 py-1 padding, text-[11px] URL) so the
//   pill fits inside the constrained browser chrome bar without
//   dominating it.
//
//   The two pills (eyebrow + URL) now read as a coherent system —
//   same animation language, same gradient stops, same proportions
//   relative to their container. Stripe / Linear use exactly this
//   kind of repeated micro-pattern to make the page feel designed
//   rather than assembled.
//
// PRESERVED:
//   - Traffic lights on the left (red / amber / emerald)
//   - URL pill centered via mx-auto inside the flex chrome bar
//   - Right-side spacer for symmetry
//   - Server component (CSS-only animation, no hooks needed)
// ==========================================

import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { cn } from '@/lib/shared/utils';

interface BrowserMockupProps {
  /** URL string shown in the address bar */
  url?: string;
  /** Content rendered below the chrome */
  children: ReactNode;
  /** Extra utility classes for the outer wrapper */
  className?: string;
}

export function BrowserMockup({
  url = 'fibidy.com',
  children,
  className,
}: BrowserMockupProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-card shadow-2xl shadow-primary/10',
        className,
      )}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2.5">
        {/* Traffic lights */}
        <div className="flex shrink-0 gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full bg-red-400/70"
            aria-hidden
          />
          <span
            className="h-2.5 w-2.5 rounded-full bg-amber-400/70"
            aria-hidden
          />
          <span
            className="h-2.5 w-2.5 rounded-full bg-emerald-400/70"
            aria-hidden
          />
        </div>

        {/*
          ── URL CAPSULE — same pill treatment as the hero eyebrow ──
          Animated gradient masked border + inset glow + Lock icon +
          vertical divider + AnimatedGradientText URL. Sized down
          proportionally for browser-chrome context.
        */}
        <div className="group relative mx-auto inline-flex items-center justify-center rounded-full px-3 py-1 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]">
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
          <Lock
            className="size-3 text-neutral-700 dark:text-neutral-300"
            aria-hidden
          />
          <hr className="mx-2 h-3 w-px shrink-0 bg-neutral-500" />
          <AnimatedGradientText className="font-mono text-[11px]">
            {url}
          </AnimatedGradientText>
        </div>

        {/* Right spacer for visual symmetry with traffic lights */}
        <div className="w-[42px] shrink-0" aria-hidden />
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
