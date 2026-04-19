'use client';

// ══════════════════════════════════════════════════════════════
// DASHBOARD CLIENT — v4 Unified Products
// File: src/app/[locale]/(dashboard)/dashboard/products/client.tsx
//
// v4: Import from use-products (not use-digital-products)
//     StorageUsageBar from dashboard/product/ (not digital-products/)
//
// [i18n FIX — 2026-04-19]
// Replaced hardcoded "Add" button label with
// `useTranslations('dashboard.products.addButton')`.
// ══════════════════════════════════════════════════════════════

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useProductsFlat } from '@/hooks/dashboard/use-products';
import { StorageUsageBar } from '@/components/dashboard/product/storage-usage-bar';
import { ProductsGrid, ProductsGridSkeleton } from '@/components/dashboard/product/product-grid';
import { Button } from '@/components/ui/button';

export function DashboardClient() {
  const t = useTranslations('dashboard.products');
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
            {t('addButton')}
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