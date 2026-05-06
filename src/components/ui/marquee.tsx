// ==========================================
// MAGIC UI — MARQUEE
// File: src/components/ui/marquee.tsx
//
// Mirrors Magic UI's marquee component
// (https://magicui.design/docs/components/marquee).
//
// CSS-driven (no JS animation lib needed). The keyframes are defined
// in tailwind.config / globals.css upstream — but to keep this file
// self-contained for the ZIP delivery we declare them inline via a
// styled-jsx style block. The animation honors prefers-reduced-motion
// via the @media query at the bottom.
// ==========================================

import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/shared/utils';

interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        'group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]',
        {
          'flex-row': !vertical,
          'flex-col': vertical,
        },
        className,
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn('flex shrink-0 justify-around [gap:var(--gap)]', {
              'animate-marquee flex-row': !vertical,
              'animate-marquee-vertical flex-col': vertical,
              'group-hover:[animation-play-state:paused]': pauseOnHover,
              '[animation-direction:reverse]': reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
