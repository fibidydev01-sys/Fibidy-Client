'use client';

// ============================================================================
// EDU BANNER — Storefront Publik
// File: src/components/store/shared/edu-banner.tsx
//
// [REDESIGN — May 2026]
// Canva EDU style — super slim, sticky DI BAWAH StoreHeader.
//
// Placement: setelah <StoreHeader /> di store/[slug]/layout.tsx
// sticky top-16 = tepat di bawah header (h-16 = 64px)
// z-40 — di bawah StoreHeader (z-50)
//
// Desktop: [GraduationCap icon] [teks] ············· [Learn more →]
// Mobile:  [GraduationCap icon] ··················· [Learn more →]
//          (teks hidden di mobile)
// ============================================================================

import { GraduationCap, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function EduBanner() {
  const t = useTranslations('store.eduBanner');

  return (
    <div className="sticky top-16 z-40 w-full border-b border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40">
      <div className="container flex items-center justify-between gap-2 px-4 py-1.5">

        {/* Left: icon + "EDU" label (always) + full teks (sm+) */}
        <div className="flex items-center gap-2 min-w-0">
          <GraduationCap
            className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400"
            aria-hidden
          />
          {/* "EDU" badge — selalu tampil */}
          <span className="text-xs font-bold tracking-wide text-blue-700 dark:text-blue-300 shrink-0">
            EDU
          </span>
          {/* Full teks — hidden di mobile, tampil di sm+ */}
          <span className="hidden sm:inline text-xs text-blue-800 dark:text-blue-300 leading-snug truncate">
            — {t('text')}
          </span>
        </div>

        {/* Right: Learn more */}
        <a
          href="https://guide.fibidy.com/edu"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 transition-colors whitespace-nowrap"
        >
          {t('learnMore')}
          <ArrowUpRight className="h-3 w-3" aria-hidden />
        </a>

      </div>
    </div>
  );
}