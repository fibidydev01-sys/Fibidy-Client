'use client';

// ============================================================================
// KASIR TABS — sub-navigasi dalam modul kasir
// File: src/components/dashboard/kasir/kasir-tabs.tsx
//
// Guide kasir menulis lima tab bawah untuk aplikasi POS berdiri sendiri.
// Di sini kasir adalah SATU bagian dari dashboard Fibidy yang sudah punya
// sidebar (desktop) dan tab bar (mobile), jadi lima tab bawah tidak mungkin
// ditambah tanpa merusak navigasi yang sudah ada.
//
// Terjemahannya: satu entri "Kasir" di navigasi utama, lalu sub-nav ini di
// dalamnya. Pemisahan tugas tetap dipatuhi — Jual / Riwayat / Stok / Laporan
// adalah empat layar berbeda, bukan satu layar campur aduk. "Menu" (kelola
// produk) sengaja TIDAK ada di sini: ia tetap di /dashboard/products, supaya
// batas "sedang berjualan" vs "sedang mengatur toko" tidak kabur.
//
// Halaman Keranjang juga tidak muncul di sub-nav: satu-satunya jalan ke sana
// adalah cart bar, dan ia bagian dari alur jualan, bukan tujuan tersendiri.
//
// [UI/UX — Agu 2026] Dua perubahan:
//
// 1. Tampilannya kini <Tabs> milik design system, bukan chip buatan tangan.
//    Isinya tetap <Link> lewat `asChild`, jadi prefetch Next.js dan klik
//    tengah/ctrl+klik tetap bekerja seperti tautan biasa. `activationMode
//    manual` dipakai supaya panah kiri/kanan memindahkan fokus tanpa ikut
//    berpindah halaman.
//
// 2. Anti-kedip. Sebelumnya `dagangType` dianggap 'PRODUK' sampai config
//    datang, sehingga toko HYBRID melihat 4 tab lalu tiba-tiba 5 — tab Papan
//    menyelip di posisi kedua dan seluruh strip bergeser. Sekarang:
//      • tinggi strip dikunci h-9 dalam SEMUA keadaan (skeleton sekalipun),
//        jadi konten di bawahnya tidak pernah bergerak vertikal;
//      • dagangType terakhir disimpan di localStorage dan dipakai sebagai
//        tebakan awal, jadi kunjungan kedua dan seterusnya langsung benar.
// ============================================================================

import { useEffect, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKasirConfig } from '@/hooks/dashboard/use-kasir';
import {
  bacaCacheDagangType,
  layarKasirUntuk,
  tulisCacheDagangType,
} from '@/lib/constants/dashboard/kasir-screens';
import { Link, usePathname } from '@/i18n/navigation';

// ── DAFTAR LAYAR: PINDAH KE MODUL BERSAMA ─────────────────────────────────
//
// `TABS`, `KasirTab`, `CACHE_KEY`, dan `bacaCache` dulu tinggal di sini.
// Semuanya pindah ke lib/constants/dashboard/kasir-screens.ts karena SIDEBAR
// juga butuh daftar yang sama — dan selama daftarnya dua, keduanya sempat
// berbeda: sidebar menampilkan Papan Kerja pada toko PRODUK, strip ini tidak.
// Lihat catatan lengkapnya di modul itu.

// [FIX — locale hilang] `stripLocalePrefix` dihapus: `usePathname` kini
// datang dari '@/i18n/navigation' dan sudah mengembalikan path tanpa prefix
// locale, jadi helper-nya tidak pernah mengubah apa pun. Lihat catatan
// panjangnya di dashboard-route-guard.tsx.

export function KasirTabs() {
  const t = useTranslations('dashboard.kasir.tabs');
  const pathname = usePathname();

  const { data: config, isLoading } = useKasirConfig();

  // useSyncExternalStore, bukan useState + useEffect: localStorage tidak ada di
  // server, dan membacanya langsung saat render akan membuat HTML server
  // berbeda dari render pertama klien (hydration mismatch). Hook ini memang
  // dibuat untuk kasus itu — getServerSnapshot dipakai di server dan pada
  // render hidrasi, snapshot klien dipakai setelahnya.
  const cache = useSyncExternalStore(
    () => () => undefined,
    bacaCacheDagangType,
    () => null,
  );

  // Strip ini satu-satunya penulis cache. Sidebar cuma membacanya — ia tidak
  // memanggil useKasirConfig() sendiri; lihat kasir-screens.ts.
  useEffect(() => {
    if (config?.dagangType) tulisCacheDagangType(config.dagangType);
  }, [config?.dagangType]);

  const dagangType = config?.dagangType ?? cache;

  // Tinggi h-9 sama persis dengan TabsList, jadi pergantian
  // skeleton → tab tidak menggeser satu piksel pun secara vertikal.
  if (!dagangType && isLoading) {
    return <Skeleton className="h-9 w-full max-w-md rounded-[var(--shape-control)]" />;
  }

  const tabsTampil = layarKasirUntuk(dagangType);

  // Tab "Jual" hanya aktif pada path persis — tanpa ini ia ikut menyala
  // di /riwayat, /stok, dan /laporan yang semuanya berawalan sama.
  const aktif =
    tabsTampil.find((tab) =>
      tab.exact ? pathname === tab.href : pathname.startsWith(tab.href),
    )?.href ?? '';

  return (
    <Tabs value={aktif} activationMode="manual" className="w-full">
      <TabsList
        aria-label={t('ariaLabel')}
        className="h-9 w-full max-w-full justify-start overflow-x-auto sm:w-fit"
      >
        {tabsTampil.map((tab) => (
          <TabsTrigger
            key={tab.href}
            value={tab.href}
            asChild
            className="flex-none px-3"
          >
            <Link href={tab.href}>
              <tab.icon className="h-4 w-4" aria-hidden />
              {t(tab.key)}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
