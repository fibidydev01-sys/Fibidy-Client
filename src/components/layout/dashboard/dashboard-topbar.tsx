'use client';

// ============================================================================
// DASHBOARD TOPBAR — kepala halaman dengan pemicu sidebar
// File: src/components/layout/dashboard/dashboard-topbar.tsx
//
// Mengikuti kepala pada contoh resmi shadcn:
//
//   <header className="flex h-16 shrink-0 items-center gap-2">
//     <SidebarTrigger /> <Separator orientation="vertical" /> <Breadcrumb />
//   </header>
//
// Sebelum berkas ini ada, dasbor TIDAK PUNYA satu pun cara membuka sidebar.
// Tidak ada SidebarTrigger, tidak ada SidebarRail, dan pintasan Ctrl/Cmd+B
// yang sudah terpasang di SidebarProvider tidak pernah bisa menghasilkan apa
// pun karena markup sidebarnya mematok `data-state="collapsed"`.
//
// Tingginya 16 (64px) = {top-nav.height} milik expo.design.md — angka yang
// sama dengan kepala sidebar di sebelahnya, jadi kedua garis bawahnya
// bertemu di ketinggian yang sama.
// ============================================================================

import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Link, usePathname } from '@/i18n/navigation';

/**
 * Ruas pertama setelah `/dashboard` → kunci i18n `dashboard.nav.*`.
 *
 * Sengaja peta eksplisit, bukan tebakan dari segmen URL. Slug rute dan label
 * yang dibaca penjual memang tidak selalu sama ("kasir" → "Kasir", tapi
 * "products" → "Produk"), dan menebaknya berarti breadcrumb yang benar dalam
 * bahasa Inggris lalu salah dalam bahasa Indonesia.
 */
const SEGMEN_KE_KUNCI: Record<string, string> = {
  products: 'products',
  kasir: 'kasir',
  studio: 'studio',
  subscription: 'subscription',
  settings: 'settings',
};

export function DashboardTopbar() {
  const t = useTranslations('dashboard.nav');
  const tKasir = useTranslations('dashboard.kasir.tabs');
  const pathname = usePathname();

  const segmen = pathname.replace(/^\/dashboard\/?/, '').split('/');
  const akar = segmen[0] ?? '';
  const anak = segmen[1] ?? '';

  const kunciAkar = SEGMEN_KE_KUNCI[akar];
  const labelAkar = kunciAkar ? t(kunciAkar) : null;

  // Hanya kasir yang punya layar anak berlabel. Sisanya berhenti di satu ruas.
  const KASIR_ANAK = ['papan', 'riwayat', 'stok', 'laporan'];
  const labelAnak =
    akar === 'kasir' && KASIR_ANAK.includes(anak) ? tKasir(anak) : null;

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />

      {labelAkar && (
        <Breadcrumb>
          <BreadcrumbList>
            {labelAnak ? (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href={`/dashboard/${akar}`}>{labelAkar}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{labelAnak}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>{labelAkar}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </header>
  );
}
