'use client';

// ==========================================
// ADMIN MAINTENANCE PAGE
// File: src/app/[locale]/(admin)/admin/maintenance/page.tsx
//
// [TIDUR-NYENYAK FIX #6] Admin maintenance tools.
// Currently houses: Cleanup Logs card.
// Future: can add more maintenance utilities here.
//
// [i18n FIX — 2026-04-19]
// Hardcoded title + subtitle replaced with `admin.maintenance.title`
// and `admin.maintenance.subtitle`. The `CleanupCard` sub-component
// already uses its own i18n namespace (`admin.maintenance.cleanup.*`)
// and `toast.admin.*`, so no changes needed there.
// ==========================================

import { Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CleanupCard } from '@/components/admin/maintenance/cleanup-card';

export default function AdminMaintenancePage() {
  const t = useTranslations('admin.maintenance');

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
          <Wrench className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Cleanup Card */}
      <CleanupCard />
    </div>
  );
}