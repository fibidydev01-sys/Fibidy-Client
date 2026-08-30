'use client';

// ============================================================================
// PRODUCTS CLIENT
// File: src/app/[locale]/(dashboard)/dashboard/products/client.tsx
//
// [SKELETON KONSISTEN — Agu 2026]
// Loading state sebelumnya: PageHeader (real) + ProductsGridSkeleton (kartu
// kecil tanpa toolbar). Masalahnya: toolbar (pencarian, urutkan, kategori,
// toggle tampilan) tidak muncul saat loading, padahal di Kasir toolbar-nya
// tetap real dan hanya grid/list-nya yang skeleton.
//
// Sekarang loading state Products konsisten dengan Kasir:
//   • Header real  (judul + tombol Tambah Produk)
//   • Toolbar real (pencarian, urutkan, kategori, grid/list toggle)
//   • Grid skeleton (view='grid') → 10 kartu skeleton
//   • List skeleton (view='list') → 6 baris skeleton
//
// view dibaca dari localStorage SEBELUM data produk datang, sama seperti
// kasir yang sudah bisa menampilkan toolbar lengkap sejak detik pertama.
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Plus,
  Package,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  SearchX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { EmptyPanel } from '@/components/dashboard/shared/empty-panel';
import { GUIDE } from '@/lib/constants/dashboard/guide-links';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProductsFlat } from '@/hooks/dashboard/use-products';
import {
  CollectionToolbar,
  useCollectionView,
} from '@/components/dashboard/shared/collection-toolbar';
import { CollectionPager } from '@/components/dashboard/shared/collection-pager';
import {
  ProductsGrid,
  ProductsGridSkeleton,
} from '@/components/dashboard/product/product-grid';
import { KasirRowsSkeleton } from '@/components/dashboard/kasir/kasir-state';
import { Link, useRouter } from '@/i18n/navigation';

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
          <Button onClick={onStart} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            {t('cta')}
          </Button>
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

  const products = useMemo(() => productsData ?? [], [productsData]);

  const [welcomeOpen, setWelcomeOpen] = useState(false);

  const tc = useTranslations('dashboard.products.collection');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [kategori, setKategori] = useState<string | null>(null);

  // view dibaca dari localStorage sejak awal — tersedia bahkan saat loading,
  // sama seperti kasir yang sudah tahu grid/list sebelum data datang.
  const [view, setView] = useCollectionView('fibidy:view:products');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [jumlahTerpilih, setJumlahTerpilih] = useState(0);

  const sortOptions = useMemo(
    () => [
      { value: 'newest', label: tc('sortNewest') },
      { value: 'oldest', label: tc('sortOldest') },
      { value: 'name-asc', label: tc('sortNameAsc') },
      { value: 'name-desc', label: tc('sortNameDesc') },
      { value: 'price-asc', label: tc('sortPriceAsc') },
      { value: 'price-desc', label: tc('sortPriceDesc') },
    ],
    [tc],
  );

  const categories = useMemo(
    () =>
      [
        ...new Set(
          products.map((p) => p.category).filter((c): c is string => Boolean(c)),
        ),
      ].sort((a, b) => a.localeCompare(b, 'id')),
    [products],
  );

  const visibleProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cocokKategori = (p: (typeof products)[number]) =>
      !kategori || p.category === kategori;

    const hasil = q
      ? products.filter(
        (p) =>
          cocokKategori(p) &&
          (p.name.toLowerCase().includes(q) ||
            (p.category ?? '').toLowerCase().includes(q)),
      )
      : products.filter(cocokKategori);

    switch (sort) {
      case 'oldest':
        return hasil.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      case 'name-asc':
        return hasil.sort((a, b) => a.name.localeCompare(b.name, 'id'));
      case 'name-desc':
        return hasil.sort((a, b) => b.name.localeCompare(a.name, 'id'));
      case 'price-asc':
        return hasil.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return hasil.sort((a, b) => b.price - a.price);
      default:
        return hasil.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  }, [products, query, sort, kategori]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / perPage));
  const halamanAman = Math.min(page, totalPages);
  const pagedProducts = visibleProducts.slice(
    (halamanAman - 1) * perPage,
    halamanAman * perPage,
  );

  const resetKey = `${query}|${sort}|${kategori ?? ''}|${perPage}`;
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setPage(1);
  }

  useEffect(() => {
    if (productsLoading) return;
    if (isRefetching) return;
    if (productsError) return;
    if (products.length > 0) return;
    setWelcomeOpen(true);
  }, [productsLoading, isRefetching, productsError, products.length]);

  const handleStart = () => {
    setWelcomeOpen(false);
    router.push('/dashboard/products/new');
  };

  const handleLater = () => {
    setWelcomeOpen(false);
  };

  const isOnboardingPhase = welcomeOpen;

  // ── Header ────────────────────────────────────────────────────────────────

  const PageHeader = () => (
    <div className="flex items-center justify-between">
      <h1 className="text-display-sm text-ink">{t('title')}</h1>
      <Button asChild>
        <Link href="/dashboard/products/new" className="gap-2">
          <Plus className="h-4 w-4" />
          {t('addButton')}
        </Link>
      </Button>
    </div>
  );

  // ── Loading ───────────────────────────────────────────────────────────────
  //
  // [KONSISTEN DENGAN KASIR]
  // Header real + Toolbar real (disabled) + skeleton konten.
  //
  // Toolbar dirender dengan props kosong/disabled saat loading:
  //   - pencarian: value='' + onChange=noop → input kosong, tidak interaktif
  //   - kategori: categories=[] → dropdown kategori tidak muncul (belum ada data)
  //   - sort: value='newest' + onChange=noop → nilai baku, tidak interaktif
  //   - view toggle: TETAP BERFUNGSI — penjual bisa pilih grid/list
  //     sebelum data datang, dan skeleton langsung menyesuaikan.

  if (productsLoading) {
    return (
      <div className="space-y-6">
        <PageHeader />

        <CollectionToolbar
          searchLabel={tc('searchLabel')}
          searchPlaceholder={tc('searchPlaceholder')}
          clearSearchLabel={tc('clearSearch')}
          query=""
          onQueryChange={() => { }}
          sortLabel={tc('sortLabel')}
          sortOptions={sortOptions}
          sort="newest"
          onSortChange={() => { }}
          categoryLabel={tc('categoryLabel')}
          categoryAllLabel={tc('categoryAll')}
          categories={[]}
          category={null}
          onCategoryChange={() => { }}
          view={view}
          onViewChange={setView}
          gridLabel={tc('viewGrid')}
          listLabel={tc('viewList')}
        />

        {view === 'grid' ? (
          <ProductsGridSkeleton count={10} />
        ) : (
          <KasirRowsSkeleton rows={6} />
        )}
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
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`}
              />
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
              <EmptyPanel
                icon={<Package />}
                title={t('empty')}
                description={t('emptyHint')}
                action={{
                  label: t('addButton'),
                  icon: <Plus className="h-4 w-4" />,
                  href: '/dashboard/products/new',
                }}
                learnLabel={t('emptyGuideLink')}
                learnHref={GUIDE.produk}
                helpLabel={t('emptyReopenDialog')}
                onHelp={() => setWelcomeOpen(true)}
              />
            </div>
          ) : (
            <>
              <CollectionToolbar
                searchLabel={tc('searchLabel')}
                searchPlaceholder={tc('searchPlaceholder')}
                clearSearchLabel={tc('clearSearch')}
                query={query}
                onQueryChange={setQuery}
                sortLabel={tc('sortLabel')}
                sortOptions={sortOptions}
                sort={sort}
                onSortChange={setSort}
                categoryLabel={tc('categoryLabel')}
                categoryAllLabel={tc('categoryAll')}
                categories={categories}
                category={kategori}
                onCategoryChange={setKategori}
                view={view}
                onViewChange={setView}
                gridLabel={tc('viewGrid')}
                listLabel={tc('viewList')}
              />

              {visibleProducts.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchX />
                    </EmptyMedia>
                    <EmptyTitle>{tc('noMatch')}</EmptyTitle>
                    <EmptyDescription>{tc('noMatchHint')}</EmptyDescription>
                  </EmptyHeader>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery('');
                      setKategori(null);
                    }}
                  >
                    {tc('clearSearch')}
                  </Button>
                </Empty>
              ) : (
                <>
                  <ProductsGrid
                    products={pagedProducts}
                    view={view}
                    onSelectionCountChange={setJumlahTerpilih}
                  />
                  <CollectionPager
                    page={halamanAman}
                    totalPages={totalPages}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    className={jumlahTerpilih > 0 ? 'md:mb-20' : undefined}
                  />
                </>
              )}
            </>
          )}
        </div>
      )}

      <WelcomeProductDialog
        open={welcomeOpen}
        onStart={handleStart}
        onLater={handleLater}
      />
    </>
  );
}