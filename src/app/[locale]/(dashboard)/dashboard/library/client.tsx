'use client';

// ==========================================
// LIBRARY CLIENT
// File: src/app/[locale]/(dashboard)/dashboard/library/client.tsx
//
// [i18n FIX — 2026-04-19]
// Replaced hardcoded "Library" title and "${count} products owned"
// subtitle with `useTranslations('dashboard.library.*')` lookups.
// JSON keys already exist.
// ==========================================

import { useTranslations } from 'next-intl';
import { useLibrary } from '@/hooks/dashboard/use-library';
import { LibraryGrid } from '@/components/library/library-grid';

export function LibraryClient() {
  const t = useTranslations('dashboard.library');
  const { data: purchases, isLoading } = useLibrary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('subtitleCount', { count: purchases?.length ?? 0 })}
        </p>
      </div>
      <LibraryGrid purchases={purchases ?? []} isLoading={isLoading} />
    </div>
  );
}