'use client';

// ============================================================================
// KASIR — TAB JUAL (pilih produk)
// File: src/app/[locale]/(dashboard)/dashboard/kasir/client.tsx
//
// Satu layar, satu tugas: MENJUAL. Tidak ada statistik, grafik, atau riwayat
// di sini — semuanya punya tab sendiri.
//
// Anti-flash: state kosong ("belum ada produk") baru boleh tampil setelah
// pemuatan pertama benar-benar selesai. Kalau tidak, setiap kali kasir
// membuka tab ini ia melihat kedipan "belum ada produk" padahal produknya ada
// — dan kepercayaan ke aplikasi rusak dalam milidetik pertama.
// ============================================================================

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AlertCircle, Package, Plus, RefreshCw, Search, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useDebounce } from '@/hooks/shared/use-debounce';
import { useKasirProducts, usePromoRulesAktif } from '@/hooks/dashboard/use-kasir';
import {
  hitungTotal,
  hitungTotalItem,
  useKasirCartStore,
} from '@/stores/kasir-cart-store';
import { CartBar } from '@/components/dashboard/kasir/cart-bar';
import { CategoryChips } from '@/components/dashboard/kasir/category-chips';
import { KasirPageHeader } from '@/components/dashboard/kasir/kasir-page-header';
import {
  ProductRow,
  ProductRowSkeleton,
} from '@/components/dashboard/kasir/product-row';
import type { TipePromo } from '@/types/kasir';

export function KasirClient() {
  const t = useTranslations('dashboard.kasir');
  const tEmpty = useTranslations('dashboard.kasir.empty');

  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const {
    data: produkResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useKasirProducts(
    debouncedSearch ? { search: debouncedSearch } : undefined,
  );

  const { data: promoAktif } = usePromoRulesAktif();

  const lines = useKasirCartStore((s) => s.lines);
  const diskon = useKasirCartStore((s) => s.diskon);
  const addProduct = useKasirCartStore((s) => s.addProduct);
  const increment = useKasirCartStore((s) => s.increment);
  const decrement = useKasirCartStore((s) => s.decrement);

  const semuaProduk = useMemo(() => produkResponse?.data ?? [], [produkResponse]);

  // Kategori diturunkan dari produk yang ada, bukan dari endpoint terpisah:
  // satu request lebih sedikit, dan chip tidak pernah menampilkan kategori
  // yang produknya sudah tidak dijual.
  const categories = useMemo(
    () =>
      [
        ...new Set(
          semuaProduk
            .map((p) => p.category)
            .filter((c): c is string => Boolean(c)),
        ),
      ].sort(),
    [semuaProduk],
  );

  const produk = useMemo(
    () =>
      kategori ? semuaProduk.filter((p) => p.category === kategori) : semuaProduk,
    [semuaProduk, kategori],
  );

  const promoPerProduk = useMemo(() => {
    const map = new Map<string, TipePromo>();
    for (const rule of promoAktif ?? []) {
      if (rule.isActive) map.set(rule.productId, rule.tipePromo);
    }
    return map;
  }, [promoAktif]);

  const qtyPerProduk = useMemo(() => {
    const map = new Map<string, number>();
    for (const line of lines) map.set(line.productId, line.qty);
    return map;
  }, [lines]);

  const { grandTotal } = hitungTotal(lines, diskon?.persen ?? 0);
  const totalItem = hitungTotalItem(lines);


  // ── Error ─────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <KasirPageHeader title={t('title')} subtitle={t('subtitle')} />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden />
          <AlertTitle>{t('error.title')}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{t('error.description')}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
                aria-hidden
              />
              {isFetching ? t('error.retrying') : t('error.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <KasirPageHeader title={t('title')} subtitle={t('subtitle')} />

      {/* Pencarian + filter kategori */}
      <div className="space-y-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-9 pr-9"
            aria-label={t('searchPlaceholder')}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label={t('clearSearch')}
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </div>

        <CategoryChips
          categories={categories}
          value={kategori}
          onChange={setKategori}
        />
      </div>

      {/* Daftar produk */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductRowSkeleton key={i} />
          ))}
        </div>
      ) : produk.length === 0 ? (
        <div className="py-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Package />
              </EmptyMedia>
              <EmptyTitle>
                {debouncedSearch || kategori
                  ? tEmpty('noMatchTitle')
                  : tEmpty('noProductTitle')}
              </EmptyTitle>
              <EmptyDescription>
                {debouncedSearch || kategori
                  ? tEmpty('noMatchDescription')
                  : tEmpty('noProductDescription')}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {debouncedSearch || kategori ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setKategori(null);
                  }}
                >
                  {tEmpty('resetFilter')}
                </Button>
              ) : (
                // Satu-satunya jembatan silang yang wajar: tanpa produk,
                // kasir memang tidak bisa apa-apa.
                <Button asChild className="gap-2">
                  <Link href="/dashboard/products/new">
                    <Plus className="h-4 w-4" aria-hidden />
                    {tEmpty('addProduct')}
                  </Link>
                </Button>
              )}
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="space-y-2 pb-2">
          {produk.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              qtyDiKeranjang={qtyPerProduk.get(p.id) ?? 0}
              promo={promoPerProduk.get(p.id)}
              onAdd={() => addProduct(p)}
              onIncrement={() => increment(p.id)}
              onDecrement={() => decrement(p.id)}
            />
          ))}
        </div>
      )}

      <CartBar totalItem={totalItem} total={grandTotal} />
    </div>
  );
}
