'use client';

// ==========================================
// STUDIO MARQUEE (FEATURES BENTO — 1st tile)
// File: src/components/marketing/sections/features/visuals/studio-marquee.tsx
//
// [PHASE 4 SPLIT — May 2026]
// Extracted from src/components/marketing/sections/features/visuals/index.tsx
// (was the StudioVisual + TEMPLATES block in the v14 monolith).
// Behavior preserved verbatim. Only path changed.
//
// ──────────────────────────────────────────────────────────────────
//
// First bento tile — Magic UI Marquee scrolling curated template
// names + one-line descriptions. Mirrors the official Magic UI
// bento "Save your files" demo with Fibidy template-curation copy.
//
// CLIENT — Marquee uses CSS keyframes (`animate-marquee`) and
// hover-pause via group classes. The animation stays CSS-driven,
// but Marquee declares 'use client' upstream so this file inherits
// the boundary.
//
// Top mask gradient (`mask-image:linear-gradient(...)`) fades the
// top edge of the marquee track so cards appear to materialize
// rather than hard-cut at the bento card boundary.
// ==========================================

import { Marquee } from '@/components/ui/marquee';
import { cn } from '@/lib/shared/utils';

interface TemplateItem {
  name: string;
  body: string;
}

const TEMPLATES: TemplateItem[] = [
  { name: 'Bold', body: 'Confident type, oversized photos.' },
  { name: 'Minimal', body: 'Whitespace and clean grids.' },
  { name: 'Pastel', body: 'Soft palette, rounded corners.' },
  { name: 'Editorial', body: 'Magazine layout, serif headlines.' },
  { name: 'Mono', body: 'Black-and-white, one accent.' },
  { name: 'Sunset', body: 'Warm gradients for cafes.' },
  { name: 'Linen', body: 'Earthy neutrals for makers.' },
  { name: 'Inkwell', body: 'Deep navy, handwritten accents.' },
];

export function StudioVisual() {
  return (
    <Marquee
      pauseOnHover
      className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
    >
      {TEMPLATES.map((f, idx) => (
        <figure
          key={idx}
          className={cn(
            'relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4',
            'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
            'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]',
            'transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none',
          )}
        >
          <div className="flex flex-row items-center gap-2">
            <div className="flex flex-col">
              <figcaption className="text-sm font-medium dark:text-white">
                {f.name}
              </figcaption>
            </div>
          </div>
          <blockquote className="mt-2 text-xs">{f.body}</blockquote>
        </figure>
      ))}
    </Marquee>
  );
}
