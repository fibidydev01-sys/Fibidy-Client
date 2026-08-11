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
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  BarChart3,
  Boxes,
  ClipboardList,
  History,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKasirConfig } from '@/hooks/dashboard/use-kasir';
import type { KasirDagangType } from '@/types/kasir';

interface KasirTab {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  /** true = hanya aktif pada path persis, bukan prefix. */
  exact?: boolean;
  /**
   * [G7] Mode dagang yang boleh melihat tab ini. Tidak diisi = selalu tampil.
   *
   * Menyembunyikan, bukan mengosongkan: tab Stok pada toko laundry akan
   * selamanya kosong karena layanan tidak punya persediaan, dan menu yang
   * selalu kosong membuat seller mengira datanya hilang.
   */
  untuk?: KasirDagangType[];
}

const TABS: KasirTab[] = [
  { href: '/dashboard/kasir', labelKey: 'jual', icon: ShoppingCart, exact: true },
  {
    href: '/dashboard/kasir/papan',
    labelKey: 'papan',
    icon: ClipboardList,
    untuk: ['JASA', 'HYBRID'],
  },
  { href: '/dashboard/kasir/riwayat', labelKey: 'riwayat', icon: History },
  {
    href: '/dashboard/kasir/stok',
    labelKey: 'stok',
    icon: Boxes,
    untuk: ['PRODUK', 'HYBRID'],
  },
  { href: '/dashboard/kasir/laporan', labelKey: 'laporan', icon: BarChart3 },
];

const CACHE_KEY = 'fibidy.kasir.dagangType';

function bacaCache(): KasirDagangType | null {
  try {
    const nilai = window.localStorage.getItem(CACHE_KEY);
    return nilai === 'PRODUK' || nilai === 'JASA' || nilai === 'HYBRID'
      ? nilai
      : null;
  } catch {
    // Safari mode privat melempar saat localStorage disentuh. Tebakan awal
    // hilang, tab tetap benar setelah config datang.
    return null;
  }
}

function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (!match) return pathname;
  return match[2] || '/';
}

export function KasirTabs() {
  const t = useTranslations('dashboard.kasir.tabs');
  const pathname = stripLocalePrefix(usePathname());

  const { data: config, isLoading } = useKasirConfig();

  // useSyncExternalStore, bukan useState + useEffect: localStorage tidak ada di
  // server, dan membacanya langsung saat render akan membuat HTML server
  // berbeda dari render pertama klien (hydration mismatch). Hook ini memang
  // dibuat untuk kasus itu — getServerSnapshot dipakai di server dan pada
  // render hidrasi, snapshot klien dipakai setelahnya.
  const cache = useSyncExternalStore(
    () => () => undefined,
    bacaCache,
    () => null,
  );

  useEffect(() => {
    if (!config?.dagangType) return;
    try {
      window.localStorage.setItem(CACHE_KEY, config.dagangType);
    } catch {
      /* tanpa cache pun tab tetap benar */
    }
  }, [config?.dagangType]);

  const dagangType = config?.dagangType ?? cache;

  // Tinggi h-9 sama persis dengan TabsList, jadi pergantian
  // skeleton → tab tidak menggeser satu piksel pun secara vertikal.
  if (!dagangType && isLoading) {
    return <Skeleton className="h-9 w-full max-w-md rounded-lg" />;
  }

  const tabsTampil = TABS.filter(
    (tab) => !tab.untuk || tab.untuk.includes(dagangType ?? 'PRODUK'),
  );

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
              {t(tab.labelKey)}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
