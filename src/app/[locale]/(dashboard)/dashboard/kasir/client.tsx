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
//
// [UI/UX — Agu 2026]
//   • Lebar halaman datang dari KasirPageShell, bukan `mx-auto max-w-2xl`.
//     Sebelumnya layar ini menciut jadi 672px sementara Papan Kerja memakai
//     lebar penuh, jadi berpindah tab menggeser judul dan strip tab.
//   • Ruang yang didapat dipakai untuk membagi katalog jadi beberapa kolom,
//     BUKAN untuk menambah pintu ke keranjang. Cart bar tetap satu-satunya
//     jalan masuk ke checkout.
//   • Saat mengetik di pencarian, daftar lama tetap di tempatnya dan hanya
//     diredupkan. Sebelumnya tiap ketikan mengganti daftar dengan skeleton.
// ============================================================================

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/shared/utils';
import { CartBar } from '@/components/dashboard/kasir/cart-bar';
import { CategoryChips } from '@/components/dashboard/kasir/category-chips';
import {
  KatalogToggle,
  type KatalogMode,
} from '@/components/dashboard/kasir/katalog-toggle';
import { LayananRow } from '@/components/dashboard/kasir/layanan-row';
import { KasirPageShell } from '@/components/dashboard/kasir/kasir-page-shell';
import { KasirSearchField } from '@/components/dashboard/kasir/kasir-search-field';
import {
  KasirEmptyState,
  KasirErrorState,
  KasirRowsSkeleton,
} from '@/components/dashboard/kasir/kasir-state';
import { ProductRow } from '@/components/dashboard/kasir/product-row';
import type { TipePromo } from '@/types/kasir';

/** Katalog dipecah jadi beberapa kolom di layar lebar. Baris selebar 1900px
 *  menyisakan ruang kosong di tengah antara nama produk dan tombol tambah. */
const GRID = 'grid gap-2 md:grid-cols-2 xl:grid-cols-3';

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

  const adaFilter = Boolean(debouncedSearch || kategori);

  // Toolbar tetap dirender di semua keadaan — termasuk saat daftarnya kosong.
  // Menyembunyikan kolom pencarian saat hasilnya nihil mengunci kasir di
  // layar kosong tanpa cara membatalkan pencariannya.
  const toolbar = (
    <div className="flex flex-col gap-3">
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
          className="sm:max-w-sm"
        />
      )}

      <KasirSearchField
        value={search}
        onChange={setSearch}
        busy={isFetching && !isLoading}
        placeholder={
          lihatJasa ? t('searchLayananPlaceholder') : t('searchPlaceholder')
        }
        clearLabel={t('clearSearch')}
        className="sm:max-w-md"
      />

      <CategoryChips
        categories={categories}
        value={kategori}
        onChange={setKategori}
        className="sm:max-w-md"
      />
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <KasirPageShell title={t('title')} subtitle={t('subtitle')}>
        <KasirErrorState
          title={t('error.title')}
          description={t('error.description')}
          retryLabel={isFetching ? t('error.retrying') : t('error.retry')}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      </KasirPageShell>
    );
  }

  return (
    <KasirPageShell
      title={t('title')}
      subtitle={t('subtitle')}
      toolbar={toolbar}
    >
      {isLoading ? (
        <KasirRowsSkeleton rows={6} className={cn(GRID, 'space-y-0')} />
      ) : daftarTampil.length === 0 ? (
        <KasirEmptyState
          icon={<Package />}
          title={
            adaFilter
              ? tEmpty('noMatchTitle')
              : lihatJasa
                ? tEmpty('noLayananTitle')
                : tEmpty('noProductTitle')
          }
          description={
            adaFilter
              ? tEmpty('noMatchDescription')
              : lihatJasa
                ? tEmpty('noLayananDescription')
                : tEmpty('noProductDescription')
          }
        >
          {adaFilter ? (
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
        </KasirEmptyState>
      ) : (
        <div
          className={cn(
            GRID,
            'pb-2 transition-opacity',
            // Konten lama tetap terbaca saat hasil pencarian berikutnya
            // sedang diambil — diredupkan, bukan dihapus dan diganti skeleton.
            isFetching && 'opacity-60',
          )}
        >
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
    </KasirPageShell>
  );
}
