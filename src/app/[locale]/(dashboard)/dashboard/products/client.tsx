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

  // `productsData ?? []` menghasilkan array BARU tiap render selama datanya
  // belum datang, dan tiga useMemo di bawah membacanya sebagai dependensi —
  // jadi ketiganya menghitung ulang tiap render tanpa ada yang berubah.
  // Sudah begitu sejak dulu; baru terlihat saat saringan kategori menambah
  // pemakai ketiga. Satu useMemo di sini memperbaiki ketiganya.
  const products = useMemo(() => productsData ?? [], [productsData]);

  const [welcomeOpen, setWelcomeOpen] = useState(false);

  // ── Pencarian, pengurutan, tampilan ──────────────────────────────────────
  //
  // Penyaringan dikerjakan DI SINI, bukan di CollectionToolbar. Bilah itu
  // melapor apa yang dipilih; halaman yang tahu arti "harga terendah" untuk
  // koleksinya sendiri. Begitu bilahnya ikut menyaring, ia berhenti bisa
  // dipakai daftar kasir yang bentuk datanya berbeda.
  const tc = useTranslations('dashboard.products.collection');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [kategori, setKategori] = useState<string | null>(null);
  const [view, setView] = useCollectionView('fibidy:view:products');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Ruang untuk bilah aksi massal yang mengambang. Lihat catatan pada
  // `onSelectionCountChange` di product-grid.tsx: bilahnya `fixed`, jadi ia
  // tidak memakan ruang sendiri, dan tanpa ini ia menutupi pager begitu
  // halaman digulir habis.
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

  // Kategori diturunkan dari produk yang ada, bukan dari endpoint terpisah:
  // satu request lebih sedikit, dan saringan tidak pernah menawarkan kategori
  // yang produknya sudah tidak dijual. Aturan yang sama dipakai kasir.
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

    // `localeCompare` dengan 'id' supaya urutan nama menghormati abjad
    // Indonesia, bukan urutan byte.
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

  // ── Halaman ──────────────────────────────────────────────────────────────
  //
  // Dipotong SETELAH disaring dan diurutkan, bukan sebelumnya — kalau tidak,
  // pencarian cuma akan menelusuri 20 produk yang kebetulan ada di halaman
  // yang sedang dibuka.
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / perPage));
  const halamanAman = Math.min(page, totalPages);
  const pagedProducts = visibleProducts.slice(
    (halamanAman - 1) * perPage,
    halamanAman * perPage,
  );

  // Mengubah kata kunci, urutan, atau jumlah baris membuat halaman ke-7 tidak
  // lagi berarti apa-apa. Direset lewat KEY, bukan efek: `useEffect` di sini
  // berarti satu render menampilkan halaman kosong sebelum resetnya masuk.
  const resetKey = `${query}|${sort}|${kategori ?? ''}|${perPage}`;
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setPage(1);
  }

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
              {/* Acuan polanya sekarang ikut komponen yang sama dengan layar
                  lain. Dulu halaman ini yang jadi contoh tapi ditulis manual,
                  jadi begitu layar lain menirunya, tiruannya yang menyimpang. */}
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
                // Satu-satunya layar yang punya dialog terpandu sungguhan.
                // Yang lain mengarah ke pusat bantuan lewat bawaan EmptyPanel.
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
                /* Kosong karena PENCARIAN, bukan karena belum punya produk.
                   Dua keadaan yang berbeda, jadi dua bentuk yang berbeda:

                   EmptyPanel adalah pola "layar kosong" milik repo ini, dan
                   kontraknya mewajibkan tautan panduan + tautan bantuan. Itu
                   benar untuk penjual yang belum punya produk sama sekali,
                   dan salah untuk penjual yang produknya ada tapi kata
                   kuncinya tidak cocok — ia tidak butuh artikel "cara
                   menambah produk", ia butuh mengosongkan kotak pencarian.

                   Jadi keadaan ini memakai primitif Empty yang lebih ringan,
                   dengan satu aksi yang benar-benar menyelesaikannya. */
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchX />
                    </EmptyMedia>
                    <EmptyTitle>{tc('noMatch')}</EmptyTitle>
                    <EmptyDescription>{tc('noMatchHint')}</EmptyDescription>
                  </EmptyHeader>
                  {/* Mengosongkan KEDUANYA. Tombol yang cuma menghapus kata
                      kunci sementara saringan kategori masih menyala akan
                      meninggalkan penjual di layar kosong yang sama. */}
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

      {/* Dialog muncul setiap visit selama products kosong */}
      <WelcomeProductDialog
        open={welcomeOpen}
        onStart={handleStart}
        onLater={handleLater}
      />
    </>
  );
}