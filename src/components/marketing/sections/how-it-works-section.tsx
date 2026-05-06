// ==========================================
// HOW IT WORKS — SIDE-BY-SIDE ALTERNATING ROWS (Vercel-open line-grid)
// File: src/components/marketing/sections/how-it-works-section.tsx
//
// Phase 5 polish v20 (May 2026 — dark mode fix):
//
// CHANGED in v20:
//   - ShareVisual: semua hardcoded hex (#ffffff, #f5f5f5, #e5e5e5, #ec4899)
//     diganti className Tailwind agar responsif terhadap dark mode.
//     SVG kini pakai currentColor + CSS variables via className, sama
//     persis dengan pola yang dipakai BuildVisual.
//   - SellVisual: idem — hardcoded fill/stroke diganti className Tailwind.
//     Bubble customer pakai fill-muted, bubble seller pakai fill-primary.
//
// PRESERVED from v19:
//   - BuildVisual (sudah benar, tidak diubah)
//   - ShareVisual shape: split card abu/putih + avatar Lucide User pink
//   - SellVisual shape: 2 bubble (customer kiri + seller kanan)
//   - Common visual signature (dotted bg, white cards, pink accent)
//   - Vercel-open layout, server component, grid background
// ==========================================

import { getTranslations } from 'next-intl/server';
import { SectionEyebrow } from '@/components/marketing/shared/section-eyebrow';
import {
  CornerCrosses,
  createGridStyle,
} from '@/components/marketing/shared/line-grid-frame';
import { howItWorksSteps } from '@/lib/data/marketing/how-it-works';
import { cn } from '@/lib/shared/utils';

const GRID = createGridStyle({ intensity: 'soft', mask: 'fade-edges' });

export async function HowItWorksSection() {
  const t = await getTranslations('marketing.howItWorks');

  const STEP_VISUALS: Record<string, () => React.ReactElement> = {
    build: BuildVisual,
    share: ShareVisual,
    sell: SellVisual,
  };

  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-20 overflow-hidden bg-background py-20 md:py-28"
    >
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0', GRID.className)}
        style={GRID.style}
      />

      <div className="container relative mx-auto px-4">
        {/* BLOCK A — HEADER */}
        <div className="relative mx-auto max-w-5xl border-y bg-background">
          <CornerCrosses />
          <div className="mx-auto max-w-3xl px-6 py-10 text-center md:py-14">
            <SectionEyebrow>{t('eyebrow')}</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {t('headline')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {t('subheadline')}
            </p>
          </div>
        </div>

        {/* BLOCK B — STEPS */}
        <div className="relative mx-auto mt-8 max-w-6xl border-y bg-background md:mt-10">
          <CornerCrosses />
          <div className="divide-y">
            {howItWorksSteps.map((step, idx) => {
              const Visual = STEP_VISUALS[step.id];
              const Icon = step.icon;
              const isReversed = idx % 2 === 1;

              return (
                <div
                  key={step.id}
                  className="grid items-center gap-8 px-6 py-12 md:grid-cols-2 md:gap-12 md:px-10 md:py-16 lg:gap-16"
                >
                  <div className={cn(isReversed && 'md:order-2')}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/5 text-base font-bold text-primary">
                        0{step.index}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-4 w-4 text-primary" aria-hidden />
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                          {t(`steps.${step.id}.eyebrow`)}
                        </p>
                      </div>
                    </div>

                    <h3 className="mt-5 text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
                      {t(`steps.${step.id}.title`)}
                    </h3>

                    <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                      {t(`steps.${step.id}.description`)}
                    </p>
                  </div>

                  <div
                    aria-hidden
                    className={cn(
                      'overflow-hidden rounded-xl border bg-muted/30',
                      isReversed && 'md:order-1',
                    )}
                  >
                    <Visual />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// SHARED — Dotted background pattern (subtle)
// ==========================================

function DottedBackground() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-50"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <pattern
        id="how-it-works-dots"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="2" cy="2" r="1" className="fill-muted-foreground/30" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#how-it-works-dots)" />
    </svg>
  );
}

// ==========================================
// VISUAL 1 — BUILD (v18 — minimalist block grid)
// Tidak diubah — sudah pakai className Tailwind dengan benar.
// ==========================================

function BuildVisual() {
  return (
    <div className="relative h-[280px] w-full overflow-hidden">
      <DottedBackground />

      <svg
        viewBox="0 0 600 280"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Template 1 — neutral */}
        <rect
          x="40"
          y="40"
          width="100"
          height="60"
          rx="6"
          className="fill-card stroke-border"
          strokeWidth="1"
        />

        {/* Template 2 — ACTIVE (pink border only) */}
        <rect
          x="40"
          y="115"
          width="100"
          height="60"
          rx="6"
          className="fill-card stroke-primary"
          strokeWidth="1.5"
        />

        {/* Template 3 — neutral */}
        <rect
          x="40"
          y="190"
          width="100"
          height="60"
          rx="6"
          className="fill-card stroke-border"
          strokeWidth="1"
        />

        {/* Connection arrow from active template to main card */}
        <path
          d="M 142 145 Q 175 145 198 130"
          className="stroke-primary"
          strokeWidth="1"
          strokeDasharray="3,3"
          fill="none"
          opacity="0.5"
        />

        {/* Main preview card */}
        <rect
          x="200"
          y="30"
          width="360"
          height="220"
          rx="10"
          className="fill-card stroke-border"
          strokeWidth="1"
        />

        {/* Browser chrome divider */}
        <line
          x1="200"
          y1="60"
          x2="560"
          y2="60"
          className="stroke-border/50"
          strokeWidth="1"
        />

        {/* 3 traffic dots */}
        <circle
          cx="216"
          cy="45"
          r="3"
          className="fill-muted stroke-border"
          strokeWidth="0.5"
        />
        <circle
          cx="228"
          cy="45"
          r="3"
          className="fill-muted stroke-border"
          strokeWidth="0.5"
        />
        <circle
          cx="240"
          cy="45"
          r="3"
          className="fill-muted stroke-border"
          strokeWidth="0.5"
        />

        {/* Hero banner */}
        <rect
          x="220"
          y="78"
          width="320"
          height="76"
          rx="6"
          className="fill-primary/10"
        />

        {/* 3 product thumbnails */}
        <rect x="220" y="170" width="98" height="64" rx="4" className="fill-muted" />
        <rect x="328" y="170" width="98" height="64" rx="4" className="fill-muted" />
        <rect x="436" y="170" width="98" height="64" rx="4" className="fill-muted" />
      </svg>
    </div>
  );
}

// ==========================================
// VISUAL 2 — SHARE (v20 — dark mode fix)
//
// PROBLEM v19: hardcoded hex fill/stroke tidak berubah di dark mode.
// FIX v20: semua warna diganti className Tailwind:
//   - Card frame:    fill-card stroke-border
//   - Top half:      fill-muted  (abu di light, dark surface di dark)
//   - Divider:       stroke-border
//   - Avatar circle: fill-card stroke-primary
//   - User icon:     stroke-primary
//
// Shape tetap sama persis seperti v19.
// ==========================================

function ShareVisual() {
  return (
    <div className="relative h-[280px] w-full overflow-hidden">
      <DottedBackground />

      <svg
        viewBox="0 0 600 280"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id="share-card-clip">
            <rect x="100" y="30" width="400" height="220" rx="10" />
          </clipPath>
        </defs>

        {/* Card frame */}
        <rect
          x="100"
          y="30"
          width="400"
          height="220"
          rx="10"
          className="fill-card stroke-border"
          strokeWidth="1"
        />

        {/* Top half — muted (adapts: grey in light, dark surface in dark) */}
        <rect
          x="100"
          y="30"
          width="400"
          height="110"
          className="fill-muted"
          clipPath="url(#share-card-clip)"
        />

        {/* Divider */}
        <line
          x1="100"
          y1="140"
          x2="500"
          y2="140"
          className="stroke-border"
          strokeWidth="1"
        />

        {/* Avatar circle — cx=300 (center), cy=85 (center of muted area) */}
        <circle
          cx="300"
          cy="85"
          r="32"
          className="fill-card stroke-primary"
          strokeWidth="2"
        />

        {/* Lucide User — head */}
        <circle
          cx="300"
          cy="76"
          r="9"
          fill="none"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Lucide User — shoulders */}
        <path
          d="M278 108 C278 97 288 90 300 90 C312 90 322 97 322 108"
          fill="none"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ==========================================
// VISUAL 3 — SELL (v20 — dark mode fix + color consistency)
//
// PROBLEM v19: hardcoded hex fill tidak berubah di dark mode.
// FIX v20: semua warna diganti className Tailwind:
//   - Card frame:         fill-card stroke-border
//   - Bubble customer:    fill-muted            (abu → dark surface)
//   - Bubble seller:      fill-primary/10 stroke-primary
//                         (tint + outline, konsisten dengan Visual 1 hero
//                          banner fill-primary/10 dan Visual 2 avatar
//                          stroke-primary)
//
// Shape tetap sama persis seperti v19.
// ==========================================

function SellVisual() {
  return (
    <div className="relative h-[280px] w-full overflow-hidden">
      <DottedBackground />

      <svg
        viewBox="0 0 600 280"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Card frame */}
        <rect
          x="120"
          y="30"
          width="360"
          height="220"
          rx="12"
          className="fill-card stroke-border"
          strokeWidth="1"
        />

        {/* Bubble 1 — customer, kiri, muted (grey in light / dark surface in dark) */}
        <rect
          x="140"
          y="70"
          width="210"
          height="52"
          rx="12"
          className="fill-muted"
        />

        {/* Bubble 2 — seller, kanan, primary tint + stroke (konsisten dengan Visual 1 & 2) */}
        <rect
          x="230"
          y="158"
          width="230"
          height="60"
          rx="12"
          className="fill-primary/10 stroke-primary"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}