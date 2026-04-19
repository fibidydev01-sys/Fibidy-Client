'use client';

import { useTranslations } from 'next-intl';
import { useStorageUsage } from '@/hooks/dashboard/use-products';
import { Progress } from '@/components/ui/progress';

export function StorageUsageBar() {
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