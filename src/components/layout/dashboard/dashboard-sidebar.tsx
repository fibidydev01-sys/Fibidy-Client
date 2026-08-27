'use client';

// ============================================================================
// DASHBOARD SIDEBAR — komposisi
// File: src/components/layout/dashboard/dashboard-sidebar.tsx
//
// Mengikuti komposisi resmi shadcn (contoh `app-sidebar.tsx`):
//
//   Sidebar variant="inset"
//   ├── SidebarHeader   → identitas toko
//   ├── SidebarContent  → NavMain × 2 grup
//   ├── SidebarFooter   → NavUser
//   └── SidebarRail     → gagang untuk membuka/menutup
//
// Berkas ini sekarang MURNI komposisi. Data nav, gerbang setup, dan dialognya
// tetap di sini karena ketiganya milik sidebar; markup menu dan menu pengguna
// pindah ke nav-main.tsx dan nav-user.tsx, sama seperti contohnya.
//
// [SETUP HIGHLIGHT — Mei 2026] Saat entri terkunci ditekan (requiresSetup +
// !isSetupComplete): MandatoryDialog muncul; "Lanjutkan Setup" akan
// mengirim CustomEvent 'setup:highlight' kalau penjual sudah berada di
// /dashboard/setup-store (supaya langkah yang sedang dibuka tidak reset ke
// langkah 1), atau menavigasi ke sana kalau belum.
// ============================================================================

import { useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import {
  CreditCard,
  LayoutDashboard,
  Layout,
  Settings,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { MandatoryDialog } from '@/components/ui/mandatory-dialog';
import { useAuthStore } from '@/stores/auth-store';
import { useLogout } from '@/hooks/auth/use-auth';
import { useSubscriptionPlan } from '@/hooks/dashboard/use-subscription-plan';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import {
  bacaCacheDagangType,
  layarKasirUntuk,
} from '@/lib/constants/dashboard/kasir-screens';
import { NavMain, type NavMainItem } from './nav-main';
import { NavUser } from './nav-user';

// ─── Data nav ───────────────────────────────────────────────────────────────

interface NavEntry {
  titleKey: string;
  href: string;
  icon: LucideIcon;
  group: 'store' | 'account';
  requiresSetup?: boolean;
  hideForEdu?: boolean;
  /**
   * Layar anak diturunkan dari KASIR_SCREENS, disaring mode dagang toko.
   * Hanya Kasir yang punya layar anak, jadi ini bendera, bukan daftar.
   */
  subKeysDinamis?: boolean;
}

const NAV_ENTRIES: NavEntry[] = [
  {
    titleKey: 'products',
    href: '/dashboard/products',
    icon: LayoutDashboard,
    group: 'store',
    requiresSetup: true,
  },
  {
    titleKey: 'kasir',
    href: '/dashboard/kasir',
    icon: ShoppingCart,
    group: 'store',
    requiresSetup: true,
    // Layar kasir. Strip tab di dalam halaman tetap ada — itu untuk berpindah
    // SAAT sudah di kasir; submenu ini untuk masuk langsung dari halaman lain
    // tanpa mampir ke Jual dulu.
    //
    // Daftarnya TIDAK ditulis di sini lagi. Dulu kelimanya dipatok apa adanya
    // sementara strip tab menyaringnya per mode dagang, dan hasilnya terlihat
    // di layar: toko PRODUK punya "Papan Kerja" di sidebar tapi tidak di tab —
    // padahal servernya menyaring papan ke `itemKind: 'JASA'`, jadi tautan itu
    // mengantar ke layar yang mustahil terisi. Sekarang keduanya membaca
    // fungsi saringan yang sama; lihat lib/constants/dashboard/kasir-screens.
    subKeysDinamis: true,
  },
  {
    titleKey: 'studio',
    href: '/dashboard/studio',
    icon: Layout,
    group: 'store',
    requiresSetup: true,
  },
  {
    titleKey: 'subscription',
    href: '/dashboard/subscription',
    icon: CreditCard,
    group: 'account',
    requiresSetup: true,
    hideForEdu: true,
  },
  { titleKey: 'settings', href: '/dashboard/settings', icon: Settings, group: 'account' },
];

const NAV_GROUPS = [
  { key: 'store' as const, labelKey: 'groupStore' },
  { key: 'account' as const, labelKey: 'groupAccount' },
];

function isSetupStorePath(pathname: string): boolean {
  return pathname.startsWith('/dashboard/setup-store');
}

// ─── Komponen ───────────────────────────────────────────────────────────────

export function DashboardSidebar() {
  const t = useTranslations('dashboard.nav');
  const tKasir = useTranslations('dashboard.kasir.tabs');
  const tGate = useTranslations('dashboard.setupStore.setupGateDialog');
  const pathname = usePathname();
  const router = useRouter();
  const tenant = useAuthStore((s) => s.tenant);
  const { logout } = useLogout();
  const { tier } = useSubscriptionPlan();

  const [gateOpen, setGateOpen] = useState(false);

  // Mode dagang dibaca dari cache yang DITULIS strip tab kasir — sidebar
  // sengaja tidak memanggil `useKasirConfig()` sendiri: ia dirender di setiap
  // halaman dasbor, termasuk milik penjual yang tidak pernah membuka Kasir.
  // Sebelum Kasir pernah dibuka sekali, nilainya null dan submenu menampilkan
  // daftar PRODUK — tebakan yang sama dengan strip tab.
  //
  // `useSyncExternalStore` dengan snapshot server `null`: localStorage tidak
  // ada di server, dan membacanya saat render akan membuat markup server
  // berbeda dari render hidrasi.
  const dagangType = useSyncExternalStore(
    () => () => undefined,
    bacaCacheDagangType,
    () => null,
  );

  const isEdu = tenant?.isEduMode === true;
  const isSetupDone = tenant?.isSetupComplete ?? true;
  const namaToko = tenant?.name ?? 'Fibidy';

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/dashboard/products') {
      return (
        pathname === '/dashboard/products' ||
        pathname.startsWith('/dashboard/products/new') ||
        pathname.match(/^\/dashboard\/products\/[^/]+\/edit$/) !== null
      );
    }
    return pathname.startsWith(href);
  };

  // Layar anak dicocokkan PERSIS, bukan lewat `startsWith`. "/dashboard/kasir"
  // adalah awalan dari keempat saudaranya, jadi `startsWith` akan menyalakan
  // "Jual" di setiap layar kasir sekaligus.
  const isSubActive = (href: string) => pathname === href;

  const buildItems = (group: 'store' | 'account'): NavMainItem[] =>
    NAV_ENTRIES.filter((e) => e.group === group)
      .filter((e) => !(isEdu && e.hideForEdu))
      .map((e) => ({
        title: t(e.titleKey),
        href: e.href,
        icon: e.icon,
        isActive: isActive(e.href),
        locked: !isSetupDone && !!e.requiresSetup,
        items: e.subKeysDinamis
          ? layarKasirUntuk(dagangType).map((layar) => ({
              title: tKasir(layar.key),
              href: layar.href,
            }))
          : undefined,
      }));

  const handleContinueSetup = () => {
    setGateOpen(false);
    if (isSetupStorePath(pathname)) {
      window.dispatchEvent(new CustomEvent('setup:highlight'));
    } else {
      router.push('/dashboard/setup-store');
    }
  };

  return (
    <>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild tooltip={namaToko}>
                <Link href="/dashboard/products">
                  <div
                    aria-hidden
                    className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-[13px] font-semibold text-sidebar-primary-foreground"
                  >
                    {namaToko.charAt(0).toUpperCase()}
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-title-sm">{namaToko}</span>
                    <span className="truncate text-caption text-muted-foreground">
                      {t(`plan.${tier.toLowerCase()}`)}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {NAV_GROUPS.map(({ key, labelKey }) => (
            <NavMain
              key={key}
              label={t(labelKey)}
              items={buildItems(key)}
              onLockedClick={() => setGateOpen(true)}
              isSubActive={isSubActive}
            />
          ))}
        </SidebarContent>

        <SidebarFooter>
          <NavUser
            name={namaToko}
            email={tenant?.email ?? ''}
            logo={tenant?.logo}
            planLabel={t(`plan.${tier.toLowerCase()}`)}
            showSubscription={!isEdu}
            labels={{
              subscription: t('subscription'),
              settings: t('settings'),
              signOut: t('signOut'),
            }}
            onSignOut={() => void logout()}
          />
        </SidebarFooter>

        {/* Gagang tipis di tepi panel — cara kedua membuka/menutup sidebar,
            di samping SidebarTrigger di kepala halaman dan Ctrl/Cmd+B. */}
        <SidebarRail />
      </Sidebar>

      <MandatoryDialog
        open={gateOpen}
        title={tGate('title')}
        description={tGate('description')}
        primaryCta={{
          label: tGate('cta'),
          onClick: handleContinueSetup,
          showArrow: true,
        }}
      />
    </>
  );
}
