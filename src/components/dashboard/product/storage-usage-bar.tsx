'use client';

// ==========================================
// STORAGE USAGE BAR
// File: src/components/dashboard/product/storage-usage-bar.tsx
//
// [PHASE 3 — DIGITAL PRODUCTS FLAG]
// When digital is gated, storage allocation is meaningless (no files to
// store). Return null at the top so the bar disappears entirely.
//
// useStorageUsage() is also gated by `enabled: FEATURES.digitalProducts`
// in the hook, so `storage` is undefined when off — but explicit early
// return here is clearer and avoids any cached-data edge cases.
// ==========================================

import { useTranslations } from 'next-intl';
import { useStorageUsage } from '@/hooks/dashboard/use-products';
import { Progress } from '@/components/ui/progress';
import { FEATURES } from '@/lib/config/features';

export function StorageUsageBar() {
  // [PHASE 3] Skip entirely when feature is gated
  if (!FEATURES.digitalProducts) return null;

  const t = useTranslations('dashboard.products.storage');
  const { data: storage } = useStorageUsage();
  if (!storage) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{t('label')}</span>
        <span>{t('usageFormat', { used: storage.used.gb, total: storage.quota.gb })}</span>
      </div>
      <Progress value={storage.percentage} className="h-1.5" />
    </div>
  );
}
