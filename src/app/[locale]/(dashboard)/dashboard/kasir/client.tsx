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
import { useTranslations } from 'next-intl';
import { Package, Plus, Wrench } from 'lucide-react';
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
import {
  KatalogToggle,
  type KatalogMode,
} from '@/components/dashboard/kasir/katalog-toggle';
import { LayananRow } from '@/components/dashboard/kasir/layanan-row';
import {
  KatalogCard,
  KatalogCardsSkeleton,
} from '@/components/dashboard/kasir/katalog-card';
import { KasirBadge, StokBadge } from '@/components/dashboard/kasir/kasir-badges';
import {
  CollectionToolbar,
  useCollectionView,
} from '@/components/dashboard/shared/collection-toolbar';
import { formatDurasiLayanan } from '@/lib/shared/product-utils';
import { labelPromo } from '@/lib/shared/kasir-promo';
import { KasirPageShell } from '@/components/dashboard/kasir/kasir-page-shell';
import {
  KasirEmptyState,
  KasirErrorState,
  KasirRowsSkeleton,
} from '@/components/dashboard/kasir/kasir-state';
import { EmptyPanel } from '@/components/dashboard/shared/empty-panel';
import { GUIDE } from '@/lib/constants/dashboard/guide-links';
import { ProductRow } from '@/components/dashboard/kasir/product-row';
import type { TipePromo } from '@/types/kasir';

/**
 * Tampilan DAFTAR: SATU kolom, sama persis dengan daftar di /dashboard/products.
 *
 * Sebelumnya `md:grid-cols-2 xl:grid-cols-3` — barisnya dipecah jadi dua atau
 * tiga kolom di layar lebar, dengan alasan "baris selebar 1900px menyisakan
 * ruang kosong di tengah".
 *
 * Alasan itu memperbaiki gejala yang salah. Ruang kosong di tengah baris bukan
 * masalah tata letak; ia yang membuat nama produk di kiri dan tombol tambah di
 * kanan punya posisi TETAP yang bisa dihafal tangan. Memecahnya jadi tiga kolom
 * memindahkan tombol tambah ke tiga koordinat berbeda tergantung kolomnya, dan
 * mata harus mencari ulang tiap baris.
 *
 * Dan yang lebih penting: Produk memakai satu kolom. Dua halaman yang
 * menampilkan koleksi yang sama persis tidak boleh punya bentuk daftar yang
 * berbeda — bedanya cuma boleh di aksinya (CRUD vs tambah–kurang).
 *
 * Yang butuh beberapa kolom di layar lebar adalah tampilan GRID, dan itu
 * memang tersedia lewat sakelar di toolbar.
 */
const LIST_SATU_KOLOM = 'flex flex-col gap-2';

/**
 * Tampilan GRID: kartu berfoto. Kolomnya lebih rapat dari daftar karena
 * kartunya lebih sempit — angka yang sama dipakai grid produk di
 * /dashboard/products, jadi berpindah antar dua halaman tidak mengubah
 * ukuran kartu yang penjual sudah hafal.
 */
const GRID_KARTU =
  'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5';

export function KasirClient() {
  const t = useTranslations('dashboard.kasir');
  const tEmpty = useTranslations('dashboard.kasir.empty');
  const tTaut = useTranslations('dashboard.kasir.emptyLinks');
  const tLayanan = useTranslations('dashboard.kasir.layanan');

  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  // Kunci penyimpanannya SENDIRI, bukan berbagi dengan `fibidy:view:products`.
  // Penjual toko baju wajar memilih grid untuk mengelola produk (di sana ia
  // melihat foto) dan daftar untuk berjualan (di sini ia mengejar kecepatan) —
  // menyatukan kuncinya memaksa satu jawaban untuk dua pertanyaan berbeda.
  //
  // Baku 'list': itu bentuk yang dipakai kasir selama ini, jadi penjual lama
  // tidak menemukan layarnya berubah sendiri setelah rilis.
  const [view, setView] = useCollectionView('fibidy:view:kasir', 'list');

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

  // ── Lencana kartu grid ───────────────────────────────────────────────────
  //
  // Ditulis di sini, bukan di dalam JSX map, karena keduanya perlu membaca
  // `promoPerProduk` dan `formatDurasiLayanan` — memanggilnya di dalam map
  // berarti fungsi yang sama dihitung ulang tiga kali per kartu.
  //
  // Isinya cerminan baris masing-masing: barang punya stok, layanan TIDAK.
  // Layanan tidak punya persediaan, dan badge "HABIS" di sana akan berbohong
  // — aturan yang sudah dipegang LayananRow sejak awal.

  const badgeProduk = (p: (typeof produk)[number]) => {
    const promo = promoPerProduk.get(p.id);
    return (
      <>
        <StokBadge stok={p.stok} minStock={p.minStock} />
        {promo && <KasirBadge tone="info">{labelPromo(promo)}</KasirBadge>}
      </>
    );
  };

  const badgeLayanan = (l: (typeof layanan)[number]) => {
    const promo = promoPerProduk.get(l.id);
    const durasi = formatDurasiLayanan(l.durasiJam);
    return (
      <>
        {l.durasiLabel && <KasirBadge tone="muted">{l.durasiLabel}</KasirBadge>}
        {durasi && (
          <KasirBadge tone="muted">
            {tLayanan(
              durasi.satuan === 'hari' ? 'estimasiHari' : 'estimasiJam',
              { nilai: durasi.nilai },
            )}
          </KasirBadge>
        )}
        {promo && <KasirBadge tone="info">{labelPromo(promo)}</KasirBadge>}
      </>
    );
  };

  const adaFilter = Boolean(debouncedSearch || kategori);

  // Toolbar tetap dirender di semua keadaan — termasuk saat daftarnya kosong.
  // Menyembunyikan kolom pencarian saat hasilnya nihil mengunci kasir di
  // layar kosong tanpa cara membatalkan pencariannya.
  const toolbar = (
    <div className="flex flex-col gap-4">
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

      {/* Bilah yang SAMA dengan /dashboard/products — bukan tiruan yang
          kebetulan mirip. Kategori pindah ke sini sebagai saringan; dulu ia
          barisan chip tersendiri di bawah pencarian, memakan satu baris penuh
          untuk informasi yang sudah tertulis di tiap kartu. Urutkan sengaja
          tidak diminta: lihat catatannya di collection-toolbar.tsx. */}
      <CollectionToolbar
        searchLabel={t('searchLabel')}
        searchPlaceholder={
          lihatJasa ? t('searchLayananPlaceholder') : t('searchPlaceholder')
        }
        clearSearchLabel={t('clearSearch')}
        query={search}
        onQueryChange={setSearch}
        searchBusy={isFetching && !isLoading}
        categoryLabel={t('categoryLabel')}
        categoryAllLabel={t('categoryAll')}
        categories={categories}
        category={kategori}
        onCategoryChange={setKategori}
        view={view}
        onViewChange={setView}
        gridLabel={t('viewGrid')}
        listLabel={t('viewList')}
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
        view === 'grid' ? (
          <KatalogCardsSkeleton count={10} className={GRID_KARTU} />
        ) : (
          <KasirRowsSkeleton rows={6} className={cn(LIST_SATU_KOLOM, 'space-y-0')} />
        )
      ) : daftarTampil.length === 0 ? (
        // Dua keadaan yang berbeda, dan bedanya penting.
        //
        // TERSARING: penjualnya punya produk, cuma filternya terlalu sempit.
        // Yang dia butuh satu tombol reset — bukan tautan panduan, karena
        // tidak ada yang perlu dia pelajari.
        //
        // BENAR-BENAR KOSONG: dia belum punya apa-apa. Di sinilah pola
        // lengkap EmptyPanel dipakai, sama dengan halaman Produk.
        adaFilter ? (
          <KasirEmptyState
            icon={<Package />}
            title={tEmpty('noMatchTitle')}
            description={tEmpty('noMatchDescription')}
          >
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setKategori(null);
              }}
            >
              {tEmpty('resetFilter')}
            </Button>
          </KasirEmptyState>
        ) : (
          <EmptyPanel
            icon={<Package />}
            title={lihatJasa ? tEmpty('noLayananTitle') : tEmpty('noProductTitle')}
            description={
              lihatJasa
                ? tEmpty('noLayananDescription')
                : tEmpty('noProductDescription')
            }
            // Satu-satunya jembatan silang yang wajar: tanpa produk,
            // kasir memang tidak bisa apa-apa.
            action={{
              label: lihatJasa ? tEmpty('addLayanan') : tEmpty('addProduct'),
              icon: <Plus className="h-4 w-4" aria-hidden />,
              href: '/dashboard/products/new',
            }}
            learnLabel={tTaut('jual.learn')}
            learnHref={GUIDE.kasir}
            helpLabel={tTaut('jual.help')}
          />
        )
      ) : (
        <div
          className={cn(
            view === 'grid' ? GRID_KARTU : LIST_SATU_KOLOM,
            'pb-2 transition-opacity',
            // Konten lama tetap terbaca saat hasil pencarian berikutnya
            // sedang diambil — diredupkan, bukan dihapus dan diganti skeleton.
            isFetching && 'opacity-60',
          )}
        >
          {lihatJasa
            ? layanan.map((l) =>
                view === 'grid' ? (
                  <KatalogCard
                    key={l.id}
                    name={l.name}
                    price={l.price}
                    imageUrl={l.images?.[0] ?? null}
                    category={l.category}
                    fallbackIcon={<Wrench className="size-8" aria-hidden />}
                    badges={badgeLayanan(l)}
                    qtyDiKeranjang={qtyPerProduk.get(l.id) ?? 0}
                    onAdd={() => addLayanan(l)}
                    onIncrement={() => increment(l.id)}
                    onDecrement={() => decrement(l.id)}
                    addLabel={t('addShort')}
                  />
                ) : (
                  <LayananRow
                    key={l.id}
                    layanan={l}
                    qtyDiKeranjang={qtyPerProduk.get(l.id) ?? 0}
                    promo={promoPerProduk.get(l.id)}
                    onAdd={() => addLayanan(l)}
                    onIncrement={() => increment(l.id)}
                    onDecrement={() => decrement(l.id)}
                  />
                ),
              )
            : produk.map((p) =>
                view === 'grid' ? (
                  <KatalogCard
                    key={p.id}
                    name={p.name}
                    price={p.price}
                    imageUrl={p.images?.[0] ?? null}
                    category={p.category}
                    fallbackIcon={<Package className="size-8" aria-hidden />}
                    badges={badgeProduk(p)}
                    qtyDiKeranjang={qtyPerProduk.get(p.id) ?? 0}
                    onAdd={() => addProduct(p)}
                    onIncrement={() => increment(p.id)}
                    onDecrement={() => decrement(p.id)}
                    addLabel={t('addShort')}
                  />
                ) : (
                  <ProductRow
                    key={p.id}
                    product={p}
                    qtyDiKeranjang={qtyPerProduk.get(p.id) ?? 0}
                    promo={promoPerProduk.get(p.id)}
                    onAdd={() => addProduct(p)}
                    onIncrement={() => increment(p.id)}
                    onDecrement={() => decrement(p.id)}
                  />
                ),
              )}
        </div>
      )}

      <CartBar totalItem={totalItem} total={grandTotal} />
    </KasirPageShell>
  );
}
