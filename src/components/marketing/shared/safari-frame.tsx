// ==========================================
// SAFARI FRAME WRAPPER
// File: src/components/marketing/shared/safari-frame.tsx
//
// Phase 5 (Magic UI polish, May 2026 — CEO unlock):
//
// Wraps the Magic UI Safari frame around custom React content. The
// Magic UI Safari component is an SVG that renders the browser chrome
// (traffic lights + URL bar) and enforces aspect ratio 1203/753.
//
// Why a wrapper:
// The base Safari component accepts `imageSrc` or `videoSrc` to fill
// the screen area, but NOT React children. We want to render our own
// rich React content (StorefrontMockup, BuilderPreview) inside the
// frame — those components have hover states, dynamic content, and
// nested elements that an <img> can't represent.
//
// Strategy:
// Stack two layers in a 1203/753 aspect-ratio container:
//   1. Safari SVG fills entire container (renders chrome at top)
//   2. React content overlays the screen region (below chrome)
//
// Screen region calibration:
// Safari's chrome occupies the top ~7% of the viewBox. Content area
// is inset slightly horizontally (the SVG has a 1-2px border) and
// extends to the bottom edge. Numbers tuned empirically against the
// Magic UI v4 Safari component — adjust if Magic UI updates the SVG.
//
// Usage:
// <SafariFrame url="tokokopi.fibidy.com">
//   <StorefrontMockupBody />
// </SafariFrame>
// ==========================================

import type { ReactNode } from 'react';
import { Safari } from '@/components/ui/safari';
import { cn } from '@/lib/shared/utils';

interface SafariFrameProps {
  /** URL string shown in the Safari address bar */
  url?: string;
  /** Content rendered inside the Safari screen area */
  children: ReactNode;
  /** Extra utility classes for the outer wrapper */
  className?: string;
}

export function SafariFrame({
  url = 'fibidy.com',
  children,
  className,
}: SafariFrameProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-xl shadow-2xl shadow-primary/10',
        className,
      )}
    >
      {/* Aspect ratio container — Safari enforces 1203/753 = 1.598:1 */}
      <div className="relative aspect-[1203/753]">
        {/*
          Safari frame layer (z-10) — renders chrome + outer rounded
          frame. Sits ON TOP so the chrome's drop shadows + traffic
          light highlights are visible above the content layer.
        */}
        <Safari
          url={url}
          mode="default"
          className="absolute inset-0 z-10 size-full pointer-events-none"
        />

        {/*
          Content layer (z-0) — positioned at the screen region.
          Top inset = chrome height (~7.04% of 753px viewBox).
          Side insets = 0.5% to clear the SVG's outer 1-2px border.
        */}
        <div
          className="absolute z-0 overflow-hidden bg-card"
          style={{
            top: '7.04%',
            left: '0.5%',
            right: '0.5%',
            bottom: '0.5%',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
