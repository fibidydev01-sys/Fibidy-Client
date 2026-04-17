'use client';

// ══════════════════════════════════════════════════════════════
// DASHBOARD CLIENT — v4 Unified Products
// v4: Import dari use-products (bukan use-digital-products)
//     StorageUsageBar dari dashboard/product/ (bukan digital-products/)
// ══════════════════════════════════════════════════════════════

import { useProductsFlat } from '@/hooks/dashboard/use-products';
import { StorageUsageBar } from '@/components/dashboard/product/storage-usage-bar';
import { ProductsGrid, ProductsGridSkeleton } from '@/components/dashboard/product/product-grid';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export function DashboardClient() {
  const { data: products, isLoading } = useProductsFlat();

  return (
    <div className="space-y-6">
      {/* Storage usage bar */}
      <StorageUsageBar />

      {/* Actions */}
      <div className="flex items-center justify-end">
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="h-4 w-4 mr-2" />
            add
          </Link>
        </Button>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <ProductsGridSkeleton />
      ) : (
        <ProductsGrid products={products ?? []} />
      )}
    </div>
  );
}