'use client';

// ============================================================================
// EDU BADGE — Dashboard Sidebar (NEW Phase D)
// File: src/components/layout/dashboard/edu-badge.tsx
//
// Badge kecil di sidebar, ditampilkan di bawah nama toko jika isEduMode = true.
// Tidak bisa di-dismiss — permanen selama isEduMode.
// ============================================================================

import { GraduationCap } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface EduBadgeProps {
  /** Tooltip text override — opsional, default dari i18n */
  tooltip?: string;
}

export function EduBadge({ tooltip }: EduBadgeProps) {
  const t = useTranslations('dashboard.edu');

  return (
    <span
      title={tooltip ?? t('sidebar.tooltip')}
      className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 select-none cursor-default"
    >
      <GraduationCap className="h-3 w-3 shrink-0" aria-hidden />
      {t('badge')}
    </span>
  );
}
