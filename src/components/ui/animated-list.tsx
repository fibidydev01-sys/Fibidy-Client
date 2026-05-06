'use client';

// ==========================================
// MAGIC UI — ANIMATED LIST (v13 — true infinite loop)
// File: src/components/ui/animated-list.tsx
//
// Phase 5 polish v13 (May 2026 — CEO directive: "BUAT DIA LOOP
// INFINITY YA!" referring to the OrdersVisual notifications card).
//
// PROBLEM (v7 → v12):
//
//   The original AnimatedList had two coupled bugs that prevented
//   true infinite loop behavior:
//
//   1. End-of-list guard in the ticker:
//
//        useEffect(() => {
//          if (index < childrenArray.length - 1) {       ← guard
//            const timeout = setTimeout(() => {
//              setIndex((prev) => (prev + 1) % len);
//            }, delay);
//            return () => clearTimeout(timeout);
//          }
//        }, [index, delay, childrenArray.length]);
//
//      Once `index === childrenArray.length - 1`, the guard turned
//      false and the timeout never scheduled again. The modulo wrap
//      inside `setIndex` was unreachable code. List froze at the
//      end.
//
//   2. Accumulating slice for the visible list:
//
//        const itemsToShow = useMemo(() => {
//          return childrenArray.slice(0, index + 1).reverse();
//        }, [index, childrenArray]);
//
//      As `index` grew, `itemsToShow` kept ALL prior items visible
//      (newest at top via reverse()). Combined with the guard
//      above, the visual outcome was: items appear one-by-one,
//      stack up to N total, then freeze.
//
//   Workaround in OrdersVisual was to duplicate NOTIFICATIONS 5x
//   so the freeze took ~20s to occur. v13 fixes the primitive so
//   that workaround is no longer load-bearing.
//
// FIX (v13):
//
//   Replaces the index counter with a monotonic `tick`, removes
//   the guard so the timeout reschedules forever, and switches
//   itemsToShow from accumulating-slice to a sliding-window
//   modular index. The visible window:
//     - starts at 1 item (tick=0)
//     - grows by 1 per tick until MAX_VISIBLE
//     - then steady-state at MAX_VISIBLE, items cycling forever
//
//   Keys are derived from the absolute `tick` (`tick-${tick - i}`),
//   NOT the child index. This is the critical detail: when child[0]
//   reappears in loop iteration N, AnimatePresence MUST see a fresh
//   key to fire enter/exit animations again. Reusing the static
//   child index as key would make subsequent loops feel "frozen"
//   even though the data is cycling.
//
// API SURFACE: unchanged.
//   - Same exports (AnimatedList, AnimatedListItem, AnimatedListProps)
//   - Same `delay` prop default (1000ms)
//   - Same className/style passthrough
//   - Drop-in replacement; consumers (OrdersVisual etc.) need no changes
//
// COROLLARY: the OrdersVisual workaround is now safely dead code.
// `NOTIFICATIONS = Array.from({ length: 5 }, () => NOTIFICATIONS).flat()`
// in feature-visuals.tsx still works (modular index just wraps
// across the longer array), but the duplication is no longer needed
// for visual continuity. Cleanup can come in a later pass.
// ==========================================

import { AnimatePresence, motion } from 'motion/react';
import {
  type ComponentPropsWithoutRef,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { cn } from '@/lib/shared/utils';

export interface AnimatedListProps extends ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
  delay?: number;
}

/**
 * Maximum items visible in the sliding window. Matches the visual
 * density of Magic UI's official animated-list demo. 4 reads as
 * "stack of recent activity" without overwhelming the bento card.
 */
const MAX_VISIBLE = 4;

export const AnimatedList = ({
  children,
  className,
  delay = 1000,
  ...props
}: AnimatedListProps) => {
  // Monotonic tick — never decrements, never wraps. Drives both
  // the modular child index AND the AnimatePresence keys.
  const [tick, setTick] = useState(0);

  const childrenArray = useMemo(
    () => (Array.isArray(children) ? children : [children]),
    [children],
  );

  // Infinite ticker — no end-of-list guard. Each timeout schedules
  // the next; cleanup runs on unmount.
  useEffect(() => {
    if (childrenArray.length === 0) return;
    const timeout = setTimeout(() => {
      setTick((prev) => prev + 1);
    }, delay);
    return () => clearTimeout(timeout);
  }, [tick, delay, childrenArray.length]);

  // Sliding window:
  //   - At tick=0: 1 item visible (child at index 0)
  //   - Grows by 1 per tick until min(childrenArray.length, MAX_VISIBLE)
  //   - Steady-state: window cycles through children indefinitely
  const itemsToShow = useMemo(() => {
    if (childrenArray.length === 0) return [];
    const windowSize = Math.min(
      childrenArray.length,
      MAX_VISIBLE,
      tick + 1,
    );
    const result: Array<{ key: string; node: React.ReactNode }> = [];

    for (let i = 0; i < windowSize; i++) {
      // Safe modulo: JS's % operator returns negative for negative
      // dividend, so we apply ((a % n) + n) % n to get a non-negative
      // index regardless of `tick - i` sign during early ticks.
      const childIndex =
        (((tick - i) % childrenArray.length) + childrenArray.length) %
        childrenArray.length;

      result.push({
        // Absolute monotonic key — ensures AnimatePresence fires
        // fresh enter/exit on every loop cycle even when the same
        // child reappears.
        key: `tick-${tick - i}`,
        node: childrenArray[childIndex],
      });
    }

    return result;
  }, [tick, childrenArray]);

  return (
    <div
      className={cn('flex flex-col items-center gap-4', className)}
      {...props}
    >
      <AnimatePresence>
        {itemsToShow.map(({ key, node }) => (
          <AnimatedListItem key={key}>{node}</AnimatedListItem>
        ))}
      </AnimatePresence>
    </div>
  );
};

AnimatedList.displayName = 'AnimatedList';

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  const animations = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, originY: 0 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: 'spring' as const, stiffness: 350, damping: 40 },
  };

  return (
    <motion.div {...animations} layout className="mx-auto w-full">
      {children}
    </motion.div>
  );
}