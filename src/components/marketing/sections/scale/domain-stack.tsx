'use client';

// ==========================================
// DOMAIN STACK (SCALE SECTION — animated visual)
// File: src/components/marketing/sections/scale/domain-stack.tsx
//
// [PHASE 5 SPLIT — May 2026]
// Extracted from src/components/marketing/sections/scale/index.tsx
// (was the inline DomainStack component + framer-motion variants
// in the v15.8 monolith). Behavior preserved verbatim.
//
// ──────────────────────────────────────────────────────────────────
//
// Vercel-inspired stacked browser-chrome visual that visualizes
// Fibidy's multi-tenant + custom-domain story in one frame:
// subdomains (slug.fibidy.com), custom domains (.id, .com), all
// running side-by-side, all SSL'd by default.
//
// Geometry:
//   - Each bar is a rounded card with browser chrome (3 traffic
//     dots, URL pill with Lock icon, right-side spacer).
//   - Stack visual: bars are absolutely positioned with vertical
//     offset = `--stack-offset` and horizontal inset that grows
//     `SIDE_INSET_STEP_PERCENT` per layer toward the back. Topmost
//     (back) bars are narrower; bottommost (front, focused) is
//     full-width.
//   - Mobile-first sizing via CSS custom properties (`--stack-offset`,
//     `--chrome-height`) — switches at sm breakpoint.
//
// Animation:
//   - framer-motion stagger reverses the children order
//     (`staggerDirection: -1`) so the FRONT bar appears first, then
//     bars stagger UPWARD to fill the stack. This reads as "one
//     storefront → many" instead of the reverse.
//   - Whileinview triggers once at 30% visibility.
//
// CLIENT REQUIREMENT:
//   framer-motion's `motion.div` and `whileInView` are client-only.
//   This is the ONLY part of the scale section that needs a client
//   boundary; the section composer (parent) stays server-side after
//   Phase 5 split.
// ==========================================

import { Lock } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { scaleDomains } from '@/lib/marketing/data/scale';
import { cn } from '@/lib/shared/utils';

// ──────────────────────────────────────────────────────────────────
// LAYOUT CONSTANT
// ──────────────────────────────────────────────────────────────────
//
// Each bar narrows by 4% on each side per "step back" in the stack.
// At 5 bars, top-most bar is inset 16% on each side (32% total
// width loss), still readable on mobile. Past 7 bars, top bars
// become hard to read at 375px viewport — keep the array ≤ 7.
// ──────────────────────────────────────────────────────────────────

const SIDE_INSET_STEP_PERCENT = 4;

// ──────────────────────────────────────────────────────────────────
// MOTION VARIANTS
//
// staggerDirection: -1 reverses the natural order — last child
// (front-most bar in the stack, the focused one) animates IN first,
// then subsequent bars stagger upward toward the top of the stack.
// delayChildren gives the section a 100ms breath before the first
// bar lands.
// ──────────────────────────────────────────────────────────────────

const stackContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      staggerDirection: -1,
      delayChildren: 0.1,
    },
  },
};

const stackBarVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────────────────────────

export function DomainStack() {
  const total = scaleDomains.length;

  return (
    <motion.div
      className={cn(
        'relative w-full',
        '[--stack-offset:28px] [--chrome-height:38px]',
        '[height:calc(var(--stack-offset)*(var(--bar-count)-1)+var(--chrome-height))]',
        'sm:[--stack-offset:36px] sm:[--chrome-height:48px]',
      )}
      style={
        {
          ['--bar-count' as string]: total,
        } as React.CSSProperties
      }
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3, margin: '0px 0px -80px 0px' }}
      variants={stackContainerVariants}
      aria-hidden
    >
      {scaleDomains.map((entry, idx) => {
        const isFocused = idx === total - 1;
        const reverseIdx = total - 1 - idx;
        const insetPercent = reverseIdx * SIDE_INSET_STEP_PERCENT;

        return (
          <motion.div
            key={entry.url}
            variants={stackBarVariants}
            className={cn(
              'absolute rounded-xl border bg-card transition-shadow',
              isFocused ? 'shadow-2xl shadow-primary/10' : 'shadow-sm',
            )}
            style={
              {
                left: `${insetPercent}%`,
                right: `${insetPercent}%`,
                top: `calc(${idx} * var(--stack-offset))`,
                zIndex: idx,
              } as React.CSSProperties
            }
          >
            <div className="flex h-[38px] items-center gap-2 px-2.5 sm:h-12 sm:px-3 sm:py-2.5">
              {/* Traffic-light dots — Vercel-style, focused bar gets brand colors */}
              <div className="flex shrink-0 gap-1 sm:gap-1.5">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5',
                    isFocused ? 'bg-red-500/85' : 'bg-muted-foreground/15',
                  )}
                />
                <span
                  className={cn(
                    'h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5',
                    isFocused ? 'bg-blue-500/85' : 'bg-muted-foreground/15',
                  )}
                />
                <span
                  className={cn(
                    'h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5',
                    isFocused
                      ? 'bg-emerald-500/85'
                      : 'bg-muted-foreground/15',
                  )}
                />
              </div>

              {/* URL pill — center, monospaced, lock icon prefix */}
              <div
                className={cn(
                  'mx-auto inline-flex min-w-0 items-center gap-1 rounded-md px-2 py-0.5 sm:gap-1.5 sm:px-3 sm:py-1',
                  isFocused ? 'bg-muted' : 'bg-muted/50',
                )}
              >
                <Lock
                  className={cn(
                    'size-2.5 shrink-0 sm:size-3',
                    isFocused
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/50',
                  )}
                />
                <span
                  className={cn(
                    'truncate font-mono text-[10px] sm:text-xs',
                    isFocused
                      ? 'text-foreground'
                      : 'text-muted-foreground/70',
                  )}
                >
                  {entry.url}
                </span>
              </div>

              {/* Right spacer — visual symmetry with traffic lights */}
              <div className="w-[32px] shrink-0 sm:w-[42px]" />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
