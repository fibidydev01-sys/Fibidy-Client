'use client';

// ============================================================================
// PRODUCTS CLIENT
// File: src/app/[locale]/(dashboard)/dashboard/products/client.tsx
//
// [PRODUCTS ONBOARDING v3 — May 2026]
// Flow untuk first-time seller (products kosong):
//
//   Load selesai → WelcomeProductDialog muncul LANGSUNG (no delay)
//     Background: BERSIH (dot pattern, no grid/empty-state)
//     Locked — hanya bisa dismiss via tombol
//     "Ayo Tambah Produk" → /dashboard/products/new
//     "Nanti" → dismiss (session only, muncul lagi next visit selama masih kosong)
//
// Returning user (products >= 1):
//   Normal — grid tampil langsung, dialog tidak pernah muncul lagi.
//
// Dismiss logic: products.length >= 1 = natural dismiss selamanya.
// Tidak perlu dismissedFirstProductDialog flag — produk itu sendiri yang jadi gate.
//
// [RACE CONDITION FIX — May 2026]
// Hapus setTimeout 600ms + hapus privateTenant dependency.
// productsLoading saja sudah cukup sebagai gate.
// ============================================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Plus,
  ArrowUpRight,
  Package,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useProductsFlat } from '@/hooks/dashboard/use-products';
import {
  ProductsGrid,
  ProductsGridSkeleton,
} from '@/components/dashboard/product/product-grid';

// ── WelcomeProductDialog ──────────────────────────────────────────────────────

function WelcomeProductDialog({
  open,
  onStart,
  onLater,
}: {
  open: boolean;
  onStart: () => void;
  onLater: () => void;
}) {
  const t = useTranslations('dashboard.products.welcomeDialog');

  return (
    <Dialog open={open} onOpenChange={() => { }}>
      <DialogContent
        className="sm:max-w-sm [&>button:last-child]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          {/* Icon */}
          <div className="flex justify-center mb-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <ShoppingBag className="h-7 w-7 text-primary" />
            </div>
          </div>

          <DialogTitle className="text-center text-lg font-bold">
            {t('title')}
          </DialogTitle>

          <DialogDescription asChild>
            <div className="space-y-3 pt-1">
              {/* Steps */}
              <div className="space-y-2">
                {(['step1', 'step2', 'step3'] as const).map((key, i) => (
                  <div key={key} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <p className="text-sm text-muted-foreground leading-snug">
                      {t(key)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Hint */}
              <div className="rounded-lg bg-muted/50 border px-3 py-2.5">
                <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                  {t('hint')}
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 flex-col gap-2 sm:flex-col">
          {/* Primary: langsung ke form tambah produk */}
          <Button onClick={onStart} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            {t('cta')}
          </Button>

          {/* Secondary: nanti — dialog muncul lagi next visit selama kosong */}
          <Button
            variant="ghost"
            onClick={onLater}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            {t('later')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── DashboardClient ───────────────────────────────────────────────────────────

export function DashboardClient() {
  const t = useTranslations('dashboard.products');
  const tError = useTranslations('dashboard.products.fetchError');
  const router = useRouter();

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
    isFetching: isRefetching,
  } = useProductsFlat();

  const products = productsData ?? [];

  const [welcomeOpen, setWelcomeOpen] = useState(false);

  // ── Dialog trigger ────────────────────────────────────────────────────────
  //
  // Gate tunggal: products.length
  //   0 produk → dialog muncul setiap visit (agresif)
  //   1+ produk → tidak pernah muncul lagi (natural dismiss)
  //
  // No setTimeout, no dismissedFirstProductDialog, no privateTenant fetch.

  useEffect(() => {
    // Gate 1: initial loading
    if (productsLoading) return;

    // Gate 2: refetching (misal balik dari /products/new setelah tambah produk)
    // Tanpa ini: products = [] sebentar saat stale → dialog flash muncul
    if (isRefetching) return;

    // Gate 3: error
    if (productsError) return;

    // Gate 4: sudah ada produk
    if (products.length > 0) return;

    // Benar-benar kosong dan tidak sedang fetch → tampilkan dialog
    setWelcomeOpen(true);
  }, [productsLoading, isRefetching, productsError, products.length]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleStart = () => {
    setWelcomeOpen(false);
    router.push('/dashboard/products/new');
  };

  const handleLater = () => {
    setWelcomeOpen(false);
  };

  // ── Background bersih saat onboarding welcome ─────────────────────────────
  // Sama seperti Studio — user fokus ke dialog, tidak ada distraksi di belakang

  const isOnboardingPhase = welcomeOpen;

  // ── Header ────────────────────────────────────────────────────────────────

  const PageHeader = () => (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
      <Button asChild>
        <Link href="/dashboard/products/new" className="gap-2">
          <Plus className="h-4 w-4" />
          {t('addButton')}
        </Link>
      </Button>
    </div>
  );

  // ── Loading ───────────────────────────────────────────────────────────────

  if (productsLoading) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <ProductsGridSkeleton />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (productsError) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{tError('title')}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{tError('description')}</p>
            <p className="text-xs opacity-80">{tError('hint')}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchProducts()}
              disabled={isRefetching}
              className="gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
              {isRefetching ? tError('retrying') : tError('retry')}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────

  return (
    <>
      {/*
        Background bersih saat onboarding welcome dialog.
        User fokus ke dialog — tidak ada distraksi grid/empty-state di belakang.
        Returning user (products >= 1) → konten normal langsung.
      */}
      {isOnboardingPhase ? (
        <div className="relative min-h-[60vh]">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <PageHeader />

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
                <EmptyContent className="flex-col items-center gap-3">
                  <Button asChild>
                    <Link href="/dashboard/products/new" className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t('addButton')}
                    </Link>
                  </Button>
                  <a
                    href="https://guide.fibidy.com/products"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t('emptyGuideLink')}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                  {/* Selalu tampil selama products kosong — tidak perlu dismissed gate */}
                  <button
                    type="button"
                    onClick={() => setWelcomeOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <HelpCircle className="h-3 w-3" />
                    {t('emptyReopenDialog')}
                  </button>
                </EmptyContent>
              </Empty>
            </div>
          ) : (
            <ProductsGrid products={products} />
          )}
        </div>
      )}

      {/* Dialog muncul setiap visit selama products kosong */}
      <WelcomeProductDialog
        open={welcomeOpen}
        onStart={handleStart}
        onLater={handleLater}
      />
    </>
  );
}