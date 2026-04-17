'use client';

import { useStorageUsage } from '@/hooks/dashboard/use-products';
import { Progress } from '@/components/ui/progress';

export function StorageUsageBar() {
  const { data: storage } = useStorageUsage();
  if (!storage) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Storage</span>
        <span>{storage.used.gb}GB / {storage.quota.gb}GB</span>
      </div>
      <Progress value={storage.percentage} className="h-1.5" />
    </div>
  );
}