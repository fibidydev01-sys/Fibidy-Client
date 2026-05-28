'use client';

// ============================================================================
// EDU DASHBOARD BANNER (REC-8)
// File: src/components/layout/dashboard/edu-dashboard-banner.tsx
//
// [PHASE D · POST-AUDIT — May 2026]
// Mirror dari storefront EduBanner — tapi di dalam dashboard.
// EDU seller sekarang lihat banner yang konsisten di dashboard maupun
// di storefront publik.
//
// Behavior:
//   - Sticky top dashboard shell (z-40)
//   - Non-dismissible — EDU mode permanen
//   - Same blue treatment sebagai storefront EduBanner
//   - Render hanya ketika tenant.isEduMode === true
//   - Self-hide via useAuthStore selector
// ============================================================================

import { GraduationCap, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';

export function EduDashboardBanner() {
  const t = useTranslations('dashboard.edu.banner');
  const isEdu = useAuthStore((s) => s.tenant?.isEduMode === true);

  if (!isEdu) return null;

  return (
    <div className="sticky top-0 z-40 w-full border-b border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
      <div className="container flex items-center justify-between gap-3 px-4 py-2 md:py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <GraduationCap
            className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
            aria-hidden
          />
          <p className="text-xs md:text-sm text-blue-800 dark:text-blue-300 leading-snug">
            {t('text')}
          </p>
        </div>
        <a
          href="https://guide.fibidy.com/edu"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex shrink-0 items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
        >
          {t('learnMore')}
          <ArrowUpRight className="h-3 w-3" aria-hidden />
        </a>
      </div>
    </div>
  );
}
