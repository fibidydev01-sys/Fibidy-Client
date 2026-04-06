'use client';

// ══════════════════════════════════════════════════════════════
// DASHBOARD CLIENT - Products Only
// ══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { subscriptionApi } from '@/lib/api/subscription';
import { queryKeys } from '@/lib/shared/query-keys';
import { useProducts } from '@/hooks/dashboard/use-products';
import { getErrorMessage } from '@/lib/api/client';
import { ProductsGrid, ProductsGridSkeleton } from '@/components/dashboard/product/product-grid';
import { UpgradeModal } from '@/components/dashboard/shared/upgrade-modal';

export function DashboardClient() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  const { data: planInfo } = useQuery({
    queryKey: queryKeys.subscription.plan(),
    queryFn: () => subscriptionApi.getMyPlan(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const showUpgradeModal = (message: string) => {
    setUpgradeMessage(message);
    setUpgradeOpen(true);
  };

  return (
    <div>
      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        description={upgradeMessage}
      />

      <ProductsTabContent
        isAtLimit={planInfo?.isAtLimit?.products}
        onAtLimit={() =>
          showUpgradeModal(
            `You've reached the ${planInfo?.limits.maxProducts} product limit. Upgrade to Business for unlimited products.`
          )
        }
      />
    </div>
  );
}

function ErrorBlock({ message, error }: { message: string; error: string }) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
      <p className="text-destructive font-medium">{message}</p>
      <p className="text-sm text-muted-foreground mt-1">{error}</p>
    </div>
  );
}

function ProductsTabContent({
  isAtLimit,
  onAtLimit,
}: {
  isAtLimit?: boolean;
  onAtLimit?: () => void;
}) {
  const { data, isLoading, isError, error } = useProducts({ limit: 100 });

  if (isLoading) return <ProductsGridSkeleton />;

  if (isError) {
    return (
      <ErrorBlock
        message="Failed to load products"
        error={getErrorMessage(error)}
      />
    );
  }

  return (
    <>
      {isAtLimit && onAtLimit && (
        <div
          className="mb-4 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 flex items-center justify-between gap-4 cursor-pointer"
          onClick={onAtLimit}
        >
          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
            Batas produk tercapai. Upgrade untuk tambah lebih banyak.
          </p>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0">
            Upgrade →
          </span>
        </div>
      )}
      <ProductsGrid products={data?.data ?? []} />
    </>
  );
}