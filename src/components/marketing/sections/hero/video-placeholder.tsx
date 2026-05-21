// ==========================================
// HERO VIDEO PLACEHOLDER
// File: src/components/marketing/sections/hero/video-placeholder.tsx
//
// [PHASE 1 — May 2026]
// Replaces the StorefrontMockup/BrowserMockup visual in the hero with
// a video frame. No real video asset exists yet, so this renders a
// polished placeholder: a 16:9 frame with a glassy play button and a
// "coming soon" hint.
//
// WHEN THE REAL VIDEO LANDS:
//   Drop a <video> (or a poster <img> + click-to-play) into the inner
//   absolute-inset container, remove the placeholder play button +
//   hint, and keep the same outer frame so the layout doesn't shift.
//   Example:
//     <video
//       className="absolute inset-0 h-full w-full object-cover"
//       poster="/marketing/hero-poster.jpg"
//       autoPlay muted loop playsInline
//     >
//       <source src="/marketing/hero.webm" type="video/webm" />
//       <source src="/marketing/hero.mp4" type="video/mp4" />
//     </video>
//
// SERVER COMPONENT — pure CSS/SVG, zero client JS. Matches the existing
// BrowserMockup chrome (rounded-xl, border, shadow-2xl shadow-primary/10)
// so the hero visual reads as part of the same system.
//
// PROPS:
//   - label: pre-translated "coming soon" / caption text from the
//     server composer.
// ==========================================

import { Play } from 'lucide-react';

interface VideoPlaceholderProps {
  /** Small caption under the play button (e.g. "Demo coming soon"). */
  label: string;
}

export function VideoPlaceholder({ label }: VideoPlaceholderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card shadow-2xl shadow-primary/10">
      {/* 16:9 frame — keeps layout stable for the future <video>. */}
      <div className="relative aspect-video w-full">
        {/* Ambient gradient wash so the empty frame still has depth. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-background to-background"
        />

        {/* Faint dotted texture for the "video surface" feel. */}
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id="hero-video-dots"
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" className="fill-muted-foreground/20" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#hero-video-dots)" />
        </svg>

        {/* Center play affordance + caption. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="group flex h-16 w-16 items-center justify-center rounded-full border border-border/60 bg-background/70 shadow-lg backdrop-blur-sm">
            <Play
              className="ml-0.5 h-6 w-6 fill-primary text-primary"
              aria-hidden
            />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}