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
// ============================================================================

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
import { cn } from '@/lib/shared/utils';
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

function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (!match) return pathname;
  return match[2] || '/';
}

export function KasirTabs() {
  const t = useTranslations('dashboard.kasir.tabs');
  const pathname = stripLocalePrefix(usePathname());

  // Sebelum config termuat, dagangType diasumsikan PRODUK — nilai default
  // kolomnya di server, dan perilaku kasir sebelum fitur jasa ada. Efeknya
  // tab bersyarat muncul sesaat setelah config datang, bukan berkedip hilang.
  const { data: config } = useKasirConfig();
  const dagangType = config?.dagangType ?? 'PRODUK';

  const tabsTampil = TABS.filter(
    (tab) => !tab.untuk || tab.untuk.includes(dagangType),
  );

  return (
    <nav
      className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
      aria-label={t('ariaLabel')}
    >
      {tabsTampil.map((tab) => {
        // Tab "Jual" hanya aktif pada path persis — tanpa ini ia ikut menyala
        // di /riwayat, /stok, dan /laporan yang semuanya berawalan sama.
        const active = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <tab.icon className="h-4 w-4" aria-hidden />
            {t(tab.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
