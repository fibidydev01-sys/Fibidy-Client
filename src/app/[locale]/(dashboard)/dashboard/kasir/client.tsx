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
import {
  useKasirConfig,
  useKasirLayanan,
  useKasirProducts,
  usePromoRulesAktif,
} from '@/hooks/dashboard/use-kasir';
import {
  hitungTotal,
  hitungTotalItem,
  useKasirCartStore,
} from '@/stores/kasir-cart-store';
import { CartBar } from '@/components/dashboard/kasir/cart-bar';
import { CategoryChips } from '@/components/dashboard/kasir/category-chips';
import {
  KatalogToggle,
  type KatalogMode,
} from '@/components/dashboard/kasir/katalog-toggle';
import { LayananRow } from '@/components/dashboard/kasir/layanan-row';
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

  // Mode dagang menentukan katalog mana yang tampil. Diambil dari config
  // tenant — BUKAN ditebak ulang dari kategori toko di sini, karena seller
  // boleh menimpanya lewat pengaturan.
  const { data: config } = useKasirConfig();
  const dagangType = config?.dagangType ?? 'PRODUK';
  const hybrid = dagangType === 'HYBRID';

  // Toko jasa murni langsung membuka daftar layanan. Toko hybrid juga —
  // di semua contoh nyata (bengkel, salon, print shop) jasa adalah alasan
  // pelanggan datang, dan barang adalah tambahan.
  const [mode, setMode] = useState<KatalogMode>('PRODUK');
  const modeAktif: KatalogMode =
    dagangType === 'JASA'
      ? 'JASA'
      : dagangType === 'PRODUK'
        ? 'PRODUK'
        : mode;
  const lihatJasa = modeAktif === 'JASA';

  const params = debouncedSearch ? { search: debouncedSearch } : undefined;
  const produkQuery = useKasirProducts(params);
  const layananQuery = useKasirLayanan(params);

  // Hanya katalog yang sedang tampil yang menentukan loading/error halaman.
  // Kalau keduanya digabung, kegagalan mengambil layanan akan menutup grid
  // produk yang sebenarnya baik-baik saja.
  const { isLoading, isError, refetch, isFetching } = lihatJasa
    ? layananQuery
    : produkQuery;

  const { data: promoAktif } = usePromoRulesAktif();

  const lines = useKasirCartStore((s) => s.lines);
  const diskon = useKasirCartStore((s) => s.diskon);
  const addProduct = useKasirCartStore((s) => s.addProduct);
  const addLayanan = useKasirCartStore((s) => s.addLayanan);
  const increment = useKasirCartStore((s) => s.increment);
  const decrement = useKasirCartStore((s) => s.decrement);

  const semuaProduk = useMemo(
    () => produkQuery.data?.data ?? [],
    [produkQuery.data],
  );
  const semuaLayanan = useMemo(
    () => layananQuery.data?.data ?? [],
    [layananQuery.data],
  );

  // Kategori diturunkan dari produk yang ada, bukan dari endpoint terpisah:
  // satu request lebih sedikit, dan chip tidak pernah menampilkan kategori
  // yang produknya sudah tidak dijual.
  const sumberKatalog = lihatJasa ? semuaLayanan : semuaProduk;

  const categories = useMemo(
    () =>
      [
        ...new Set(
          sumberKatalog
            .map((p) => p.category)
            .filter((c): c is string => Boolean(c)),
        ),
      ].sort(),
    [sumberKatalog],
  );

  const produk = useMemo(
    () =>
      kategori ? semuaProduk.filter((p) => p.category === kategori) : semuaProduk,
    [semuaProduk, kategori],
  );

  const layanan = useMemo(
    () =>
      kategori
        ? semuaLayanan.filter((p) => p.category === kategori)
        : semuaLayanan,
    [semuaLayanan, kategori],
  );

  const daftarTampil = lihatJasa ? layanan : produk;

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

      {/* Toggle katalog — hanya toko hybrid yang punya dua sisi untuk dipilih */}
      {hybrid && (
        <KatalogToggle
          value={modeAktif}
          onChange={(m) => {
            setMode(m);
            // Kategori barang dan kategori layanan adalah dua daftar berbeda;
            // membawa filter lama ke katalog sebelah hampir selalu
            // menghasilkan layar kosong yang membingungkan.
            setKategori(null);
          }}
        />
      )}

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
            placeholder={
              lihatJasa ? t('searchLayananPlaceholder') : t('searchPlaceholder')
            }
            className="pl-9 pr-9"
            aria-label={
              lihatJasa ? t('searchLayananPlaceholder') : t('searchPlaceholder')
            }
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
      ) : daftarTampil.length === 0 ? (
        <div className="py-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Package />
              </EmptyMedia>
              <EmptyTitle>
                {debouncedSearch || kategori
                  ? tEmpty('noMatchTitle')
                  : lihatJasa
                    ? tEmpty('noLayananTitle')
                    : tEmpty('noProductTitle')}
              </EmptyTitle>
              <EmptyDescription>
                {debouncedSearch || kategori
                  ? tEmpty('noMatchDescription')
                  : lihatJasa
                    ? tEmpty('noLayananDescription')
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
                    {lihatJasa ? tEmpty('addLayanan') : tEmpty('addProduct')}
                  </Link>
                </Button>
              )}
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="space-y-2 pb-2">
          {lihatJasa
            ? layanan.map((l) => (
                <LayananRow
                  key={l.id}
                  layanan={l}
                  qtyDiKeranjang={qtyPerProduk.get(l.id) ?? 0}
                  promo={promoPerProduk.get(l.id)}
                  onAdd={() => addLayanan(l)}
                  onIncrement={() => increment(l.id)}
                  onDecrement={() => decrement(l.id)}
                />
              ))
            : produk.map((p) => (
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
