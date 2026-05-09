'use client';

// ==========================================
// CHANNELS ANIMATED BEAM (FEATURES BENTO — 3rd tile)
// File: src/components/marketing/sections/features/visuals/channels-beam.tsx
//
// [PHASE 4 SPLIT — May 2026]
// Extracted from src/components/marketing/sections/features/visuals/index.tsx
// (was the ChannelsVisual + Circle helper block in the v14 monolith).
// Behavior preserved verbatim. Only path changed.
//
// SosmedIcon record split out to ./channels-icons.tsx for further
// modularity.
//
// ──────────────────────────────────────────────────────────────────
//
// Third bento tile — Magic UI AnimatedBeam visualizing how a Fibidy
// storefront fans out to multiple channels (Instagram, TikTok, X,
// Reddit, WhatsApp) and back to the customer. Mirrors the official
// Magic UI bento "Integrations" demo with Fibidy multi-channel copy.
//
// Layout (left → right):
//   [User] ─── beam ──→ [Globe hub] ←── 5 beams ──── [5 sosmed]
//
// The hub uses a Lucide Globe icon (replacing the OpenAI SVG from
// the official demo) and the user avatar uses Lucide User. Sosmed
// icons live in ./channels-icons.tsx.
//
// CLIENT — useRef × 7 + AnimatedBeam (motion/react) for the
// duration=3s gradient line animations. AnimatedBeam observes the
// container with ResizeObserver and recomputes its SVG path on
// container resize, so the layout stays correct on viewport changes.
//
// Top mask gradient softens the top edge of the panel for visual
// integration with the bento card chrome.
// ==========================================

import { forwardRef, useRef } from 'react';
import { Globe, User } from 'lucide-react';
import { AnimatedBeam } from '@/components/ui/animated-beam';
import { cn } from '@/lib/shared/utils';
import { SosmedIcon } from './channels-icons';

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]',
        className,
      )}
    >
      {children}
    </div>
  );
});
Circle.displayName = 'Circle';

export function ChannelsVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden p-10 [mask-image:linear-gradient(to_top,transparent_5%,#000_30%)]"
    >
      <div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-10">
        {/* Left: User */}
        <div className="flex flex-col justify-center">
          <Circle ref={div7Ref}>
            <User className="size-6 text-gray-700" />
          </Circle>
        </div>

        {/* Center: Globe hub */}
        <div className="flex flex-col justify-center">
          <Circle ref={div6Ref} className="size-16">
            <Globe className="size-8 text-gray-800" />
          </Circle>
        </div>

        {/* Right: 5 sosmed icons */}
        <div className="flex flex-col justify-center gap-2">
          <Circle ref={div1Ref}>
            <SosmedIcon.Instagram />
          </Circle>
          <Circle ref={div2Ref}>
            <SosmedIcon.TikTok />
          </Circle>
          <Circle ref={div3Ref}>
            <SosmedIcon.X />
          </Circle>
          <Circle ref={div4Ref}>
            <SosmedIcon.Reddit />
          </Circle>
          <Circle ref={div5Ref}>
            <SosmedIcon.WhatsApp />
          </Circle>
        </div>
      </div>

      <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={div6Ref} duration={3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div6Ref} duration={3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={div6Ref} duration={3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div6Ref} duration={3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div5Ref} toRef={div6Ref} duration={3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div6Ref} toRef={div7Ref} duration={3} />
    </div>
  );
}
