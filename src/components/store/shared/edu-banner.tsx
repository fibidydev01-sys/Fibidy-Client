'use client';

// ============================================================================
// EDU BANNER — Storefront Publik (NEW Phase D)
// File: src/components/store/shared/edu-banner.tsx
//
// Banner sticky di atas StoreHeader. Tidak bisa ditutup (no dismiss button).
// Hanya muncul jika tenant.isEduMode === true.
// Placement: di store/[slug]/layout.tsx SEBELUM <StoreHeader />
//
// Warna: bg-blue-50 / border-blue-200 (light) + dark variant
// Link "Pelajari" → guide.fibidy.com/edu (opens in new tab)
// ============================================================================

import { GraduationCap, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function EduBanner() {
  const t = useTranslations('store.eduBanner');

  return (
    <div className="sticky top-0 z-[60] w-full border-b border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
      <div className="container flex items-center justify-between gap-3 px-4 py-2.5">
        {/* Left: icon + text */}
        <div className="flex items-center gap-2.5 min-w-0">
          <GraduationCap
            className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
            aria-hidden
          />
          <p className="text-sm text-blue-800 dark:text-blue-300 leading-snug">
            {t('text')}
          </p>
        </div>

        {/* Right: learn more link */}
        <a
          href="https://guide.fibidy.com/edu"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
        >
          {t('learnMore')}
          <ArrowRight className="h-3 w-3" aria-hidden />
        </a>
      </div>
    </div>
  );
}
