'use client';

// ============================================================================
// PRODUCTS CLIENT
// File: src/app/[locale]/(dashboard)/dashboard/products/client.tsx
//
// [PHASE C v2 — May 2026]
// FirstProductDialog: DB-based (dismissedFirstProductDialog field).
// - Muncul setiap kunjungan selama products = 0 && dismissed = false
// - Dismiss permanen: PATCH dismissedFirstProductDialog = true ke DB
// - Trigger: delay 600ms setelah mount
//
// Empty state: menggunakan komponen Empty dari shadcn/ui.
// Link ke guide.fibidy.com — pakai <a> tag langsung, bukan Button render prop.
//
// DIHAPUS: sessionStorage flags (dead code sebelumnya)
// ============================================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus, ArrowUpRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useProductsFlat } from '@/hooks/dashboard/use-products';
import { usePrivateTenant, useUpdateTenant } from '@/hooks/dashboard/use-tenant';
import { ProductsGrid, ProductsGridSkeleton } from '@/components/dashboard/product/product-grid';

export function DashboardClient() {
  const t = useTranslations('dashboard.products');
  const tDialog = useTranslations('dashboard.products.firstProductDialog');
  const router = useRouter();

  const { data: productsData, isLoading: productsLoading } = useProductsFlat();
  const { data: privateTenant, isLoading: tenantLoading } = usePrivateTenant();
  const { updateTenant } = useUpdateTenant();

  const products = productsData ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);

  // ── Trigger FirstProductDialog ───────────────────────────────────────────
  useEffect(() => {
    if (productsLoading || tenantLoading) return;
    if (!privateTenant) return;
    if (products.length > 0) return;
    if (privateTenant.dismissedFirstProductDialog === true) return;

    const timer = setTimeout(() => setDialogOpen(true), 600);
    return () => clearTimeout(timer);
  }, [productsLoading, tenantLoading, products.length, privateTenant]);

  // ── Dismiss — PATCH ke DB ────────────────────────────────────────────────
  const handleDismiss = async () => {
    setDialogOpen(false);
    try {
      await updateTenant({ dismissedFirstProductDialog: true });
    } catch {
      // Silent — dialog sudah tertutup
    }
  };

  const handleAddProduct = async () => {
    setDialogOpen(false);
    try {
      await updateTenant({ dismissedFirstProductDialog: true });
    } catch {
      // Silent
    }
    router.push('/dashboard/products/new');
  };

  if (productsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <Button asChild>
            <Link href="/dashboard/products/new" className="gap-2">
              <Plus className="h-4 w-4" />
              {t('addButton')}
            </Link>
          </Button>
        </div>
        <ProductsGridSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <Button asChild>
            <Link href="/dashboard/products/new" className="gap-2">
              <Plus className="h-4 w-4" />
              {t('addButton')}
            </Link>
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="py-8">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Package />
                </EmptyMedia>
                <EmptyTitle>{t('empty')}</EmptyTitle>
                <EmptyDescription>{t('emptyHint')}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="flex-row justify-center gap-2">
                <Button asChild>
                  <Link href="/dashboard/products/new" className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t('addButton')}
                  </Link>
                </Button>
              </EmptyContent>
              {/* Learn more — pakai <a> biasa, bukan Button render prop */}
              <a
                href="https://guide.fibidy.com/products"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
              >
                Pelajari cara listing produk
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </Empty>
          </div>
        ) : (
          <ProductsGrid products={products} />
        )}
      </div>

      {/* ── FirstProductDialog ─────────────────────────────────────────────── */}
      <AlertDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) handleDismiss();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40">
                <Package className="h-5 w-5 text-emerald-600" />
              </div>
              <AlertDialogTitle>{tDialog('title')}</AlertDialogTitle>
            </div>
            <AlertDialogDescription>{tDialog('description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handleDismiss}>
              {tDialog('later')}
            </Button>
            <Button onClick={handleAddProduct} className="gap-2">
              <Plus className="h-4 w-4" />
              {tDialog('addNow')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}