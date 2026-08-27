'use client';

// ============================================================================
// SETTINGS PAGE CLIENT
// File: src/app/[locale]/(dashboard)/dashboard/settings/client.tsx
//
// [EDU BADGE — May 2026]
// Badge section ditambah di atas settings list:
//   - EDU mode (isEduMode = true):
//       Badge biru "Student Mode" — learning simulation, fitur payment disabled
//
// [PANGKAS PRODUK DIGITAL] KycBanner (Stripe Connect) dicabut — tidak ada
// lagi verifikasi identitas karena platform tidak menyalurkan dana penjualan.
//
// EduDashboardBanner dihapus dari layout global — badge ini penggantinya
// yang lebih kontekstual (hanya muncul di Settings, bukan semua halaman).
//
// [LAYER 8 — 2026-04-19] Preferences group: Language + Dark Mode
// ============================================================================

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import {
  Store,
  Star,
  Phone,
  Share2,
  CreditCard,
  KeyRound,
  Sun,
  Moon,
  FileText,
  LogOut,
  ChevronRight,
  Languages,
  GraduationCap,
  ExternalLink,
  Percent,
  Gift,
  SlidersHorizontal,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Section components
import { HeroSection } from '@/components/dashboard/settings/hero';
import { AboutSection } from '@/components/dashboard/settings/about';
import { ContactSection } from '@/components/dashboard/settings/contact';
import { SocialSection } from '@/components/dashboard/settings/social';
import { PasswordSection } from '@/components/dashboard/settings/password';
import { LanguageSection } from '@/components/dashboard/settings/language';
import { SubscriptionPageContent } from '@/components/dashboard/subscription/subscription-page-content';
// [KASIR] Preset diskon & program promo — aturan yang dikonfigurasi
// sesekali oleh pemilik toko, bukan pekerjaan harian kasir.
import { KasirDiskonPresetSection } from '@/components/dashboard/settings/kasir-diskon-preset';
import { KasirPromoSection } from '@/components/dashboard/settings/kasir-promo';
import { KasirModeDagangSection } from '@/components/dashboard/settings/kasir-mode-dagang';

// Hooks
import { useLogout } from '@/hooks/auth/use-auth';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/shared/utils';
import { PAGE_COLUMN } from '@/components/dashboard/shared/page-column';
import { Skeleton } from '@/components/ui/skeleton';
import { KasirPlanGate } from '@/components/dashboard/kasir/kasir-plan-gate';


// ==========================================
// Types
// ==========================================

type SettingId =
  | 'bio'
  | 'featured'
  | 'contact'
  | 'social'
  | 'subscription'
  | 'password'
  | 'language'
  | 'kasir-mode'
  | 'diskon-preset'
  | 'promo'
  | 'about-fibidy';

type GroupKey =
  | 'store'
  | 'kasir'
  | 'channels'
  | 'preferences'
  | 'account'
  | 'legal';

interface SettingRow {
  id: SettingId | 'theme-toggle' | 'sign-out';
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  descriptionKey: string;
  href?: string;
  isThemeToggle?: boolean;
  isSignOut?: boolean;
}

// ==========================================
// EduModeBadge — Student Mode info card
// ==========================================

function EduModeBadge() {
  // Pakai existing keys — dashboard.edu.badge + dashboard.edu.banner.*
  const tEdu = useTranslations('dashboard.edu');

  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
          <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 leading-snug">
            {tEdu('badge')}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5 leading-relaxed">
            {tEdu('banner.text')}
          </p>
          <a
            href="https://guide.fibidy.com/edu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 transition-colors mt-1.5"
          >
            {tEdu('banner.learnMore')}
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Main component
// ==========================================

/**
 * Skeleton selama gerbang paket kasir memeriksa hak akses.
 *
 * Bentuknya mengikuti SEKSI Pengaturan — judul lalu beberapa kartu — bukan
 * halaman kasir penuh seperti default KasirPlanGate. Tanpa ini, membuka
 * "Mode Dagang & Struk" memperlihatkan kerangka halaman kasir sesaat lalu
 * melompat ke bentuk seksi.
 */
function SeksiKasirSkeleton() {
  return (
    <div className={cn(PAGE_COLUMN, 'space-y-4 pb-20 md:pb-6')}>
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  );
}

export function SettingsClient() {
  const t = useTranslations('dashboard.settings');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const { logout } = useLogout();

  const tenant = useAuthStore((s) => s.tenant);
  const isEdu = tenant?.isEduMode === true;


  const sectionParam = searchParams.get('section') as SettingId | null;
  const [activeSection, setActiveSection] = useState<SettingId | null>(sectionParam);

  useEffect(() => {
    setActiveSection(sectionParam);
  }, [sectionParam]);

  const handleOpen = (id: SettingId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('section', id);
    router.push(`${pathname}?${params.toString()}`);
    setActiveSection(id);
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('section');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    setActiveSection(null);
  };

  // ==========================================
  // Groups definition
  // ==========================================

  const groups = useMemo(() => {
    const isDark = theme === 'dark';

    const tree: Record<GroupKey, SettingRow[]> = {
      store: [
        {
          id: 'bio',
          icon: Store,
          labelKey: 'store.bio.label',
          descriptionKey: 'store.bio.description',
        },
        {
          id: 'featured',
          icon: Star,
          labelKey: 'store.featured.label',
          descriptionKey: 'store.featured.description',
        },
        {
          id: 'contact',
          icon: Phone,
          labelKey: 'store.contact.label',
          descriptionKey: 'store.contact.description',
        },
      ],
      // [KASIR] Diskon & Promo. Kasir hanya MEMILIH preset saat transaksi;
      // pembuatan aturannya sesekali saja — itu persis definisi Pengaturan.
      kasir: [
        // Paling atas karena ia yang menentukan bentuk seluruh modul kasir —
        // katalog mana yang tampil, tab mana yang ada. Preset diskon dan promo
        // adalah penyetelan di dalam bentuk itu.
        {
          id: 'kasir-mode',
          icon: SlidersHorizontal,
          labelKey: 'kasir.mode.label',
          descriptionKey: 'kasir.mode.description',
        },
        {
          id: 'diskon-preset',
          icon: Percent,
          labelKey: 'kasir.diskonPreset.label',
          descriptionKey: 'kasir.diskonPreset.description',
        },
        {
          id: 'promo',
          icon: Gift,
          labelKey: 'kasir.promo.label',
          descriptionKey: 'kasir.promo.description',
        },
      ],
      channels: [
        {
          id: 'social',
          icon: Share2,
          labelKey: 'channels.social.label',
          descriptionKey: 'channels.social.description',
        },
      ],
      preferences: [
        {
          id: 'language',
          icon: Languages,
          labelKey: 'preferences.language.label',
          descriptionKey: 'preferences.language.description',
        },
        {
          id: 'theme-toggle',
          icon: isDark ? Sun : Moon,
          labelKey: isDark
            ? 'preferences.lightMode.label'
            : 'preferences.darkMode.label',
          descriptionKey: isDark
            ? 'preferences.lightMode.description'
            : 'preferences.darkMode.description',
          isThemeToggle: true,
        },
      ],
      account: [
        {
          id: 'subscription',
          icon: CreditCard,
          labelKey: 'account.subscription.label',
          descriptionKey: 'account.subscription.description',
        },
        {
          id: 'password',
          icon: KeyRound,
          labelKey: 'account.changePassword.label',
          descriptionKey: 'account.changePassword.description',
        },
      ],
      legal: [
        {
          id: 'about-fibidy',
          icon: FileText,
          labelKey: 'legal.aboutFibidy.label',
          descriptionKey: 'legal.aboutFibidy.description',
          href: '/legal',
        },
      ],
    };

    return tree;
  }, [theme]);

  const groupOrder: GroupKey[] = [
    'store',
    'kasir',
    'channels',
    'preferences',
    'account',
    'legal',
  ];

  // ==========================================
  // Section renderer
  // ==========================================

  if (activeSection) {
    const sectionMap: Record<SettingId, React.ReactNode> = {
      bio: <HeroSection onBack={handleBack} />,
      featured: <AboutSection onBack={handleBack} />,
      contact: <ContactSection onBack={handleBack} />,
      social: <SocialSection onBack={handleBack} />,
      subscription: <SubscriptionPageContent onBack={handleBack} />,
      password: <PasswordSection onBack={handleBack} />,
      language: <LanguageSection onBack={handleBack} />,
      // [FINALISASI] Ketiga seksi kasir dibungkus KasirPlanGate. Semua
      // endpoint kasir menolak tenant FREE dengan 403, dan tanpa gerbang
      // penolakan itu muncul sebagai layar rusak, bukan penjelasan:
      // Mode Dagang macet di skeleton selamanya (`isLoading || !config` —
      // isLoading selesai, config tetap undefined), sementara Preset Diskon
      // dan Promo menampilkan "belum ada data" seolah seller-nya yang belum
      // membuat apa-apa.
      //
      // Gerbangnya memakai query yang SAMA (useKasirConfig), jadi tidak ada
      // permintaan tambahan — cache TanStack Query membaginya dengan seksi
      // di dalamnya.
      'kasir-mode': (
        <KasirPlanGate fallback={<SeksiKasirSkeleton />}>
          <KasirModeDagangSection onBack={handleBack} />
        </KasirPlanGate>
      ),
      'diskon-preset': (
        <KasirPlanGate fallback={<SeksiKasirSkeleton />}>
          <KasirDiskonPresetSection onBack={handleBack} />
        </KasirPlanGate>
      ),
      promo: (
        <KasirPlanGate fallback={<SeksiKasirSkeleton />}>
          <KasirPromoSection onBack={handleBack} />
        </KasirPlanGate>
      ),
      'about-fibidy': null,
    };

    const node = sectionMap[activeSection];
    // h-full — without it this div block-sizes to its own (often short)
    // content instead of inheriting DashboardShell's stretched height,
    // which left the section's sticky WizardNav floating right after
    // the content on short pages (Language, Password) instead of
    // bottoming out at the real viewport edge. See dashboard-shell.tsx.
    //
    // [FIX — lebar halaman] `max-w-2xl mx-auto` dilepas dari SINI: setiap
    // seksi sudah membungkus isinya sendiri di kolom itu (about.tsx,
    // contact.tsx, social.tsx, password.tsx, language.tsx, …). Cap ganda
    // tidak mengubah apa pun secara visual, tapi membuat lebar seksi
    // seolah diatur dua tempat — dan yang di sini bukan pemiliknya.
    if (node) return <div className="h-full">{node}</div>;
  }

  // ==========================================
  // List view
  // ==========================================

  // [FIX — lebar halaman] Daftar ini dulu `max-w-2xl mx-auto`: 672px,
  // dipusatkan. Produk dan Kasir memakai lebar penuh dan rata kiri, jadi
  // berpindah ke Pengaturan menggeser judul ke tengah layar — modul yang
  // sama terasa seperti dua aplikasi berbeda. Persis keluhan yang sudah
  // ditulis KasirPageShell di header-nya.
  //
  // Mengikuti aturan yang sama pula: konten yang terlalu lebar untuk dibaca
  // TIDAK dipersempit dengan max-w, melainkan dipecah jadi grid. Baris
  // pengaturan itu pendek, jadi di layar lebar dua kolom mengisi ruang tanpa
  // membuat satu baris pun jadi terlalu panjang untuk dipindai.
  //
  // `items-start` wajib: tanpa itu kartu di satu kolom meregang mengikuti
  // tinggi kolom sebelahnya yang isinya lebih banyak.
  // [LEBAR KONSISTEN] Daftar ini ikut PAGE_COLUMN, sama dengan seksi-seksinya.
  // Sebelumnya daftar memakai lebar dashboard penuh (terukur 1216px di 1440)
  // sementara tiap seksi terkunci 672px — membuka satu seksi menyusutkan
  // halaman 544px. Kerangkanya harus diam saat isinya berganti.
  return (
    <div className={cn(PAGE_COLUMN, 'pb-10')}>
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

      {/* EDU mode → Student Mode badge. Seller biasa → tidak ada badge. */}
      {isEdu ? <EduModeBadge /> : null}

      {/* [FINAL] Daftar seksi tetap SATU KOLOM memanjang — keputusan pemilik
          produk, bukan kelalaian. Sempat dipecah dua kolom saat kerangkanya
          masih dibatasi 1024px; begitu halaman mengikuti lebar dashboard
          penuh, dua kolom membuat mata melompat bolak-balik untuk memindai
          daftar yang urutannya justru bermakna. Baris dengan ikon, judul,
          dan chevron terbaca baik di lebar berapa pun. */}
      <div className="space-y-6">
        {groupOrder.map((groupKey) => {
          const rows = groups[groupKey];
          if (!rows || rows.length === 0) return null;

          return (
            <div key={groupKey} className="space-y-2">
              <h2 className="text-xs uppercase tracking-wide text-muted-foreground font-medium px-1">
                {t(`groups.${groupKey}`)}
              </h2>

              <Card>
                <CardContent className="p-0 divide-y">
                  {rows.map((row) => {
                    const Icon = row.icon;

                    // Theme toggle row
                    if (row.isThemeToggle) {
                      return (
                        <button
                          key={row.id}
                          type="button"
                          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                          className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
                        >
                          <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{t(row.labelKey)}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {t(row.descriptionKey)}
                            </div>
                          </div>
                        </button>
                      );
                    }

                    // Link row
                    if (row.href) {
                      return (
                        <button
                          key={row.id}
                          type="button"
                          onClick={() => router.push(row.href!)}
                          className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
                        >
                          <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{t(row.labelKey)}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {t(row.descriptionKey)}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </button>
                      );
                    }

                    // Inline section row
                    return (
                      <button
                        key={row.id}
                        type="button"
                        onClick={() => handleOpen(row.id as SettingId)}
                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
                      >
                        <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{t(row.labelKey)}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {t(row.descriptionKey)}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          );
        })}

        {/* Sign out */}
        <div className="pt-2">
          <Card>
            <CardContent className="p-0">
              <button
                type="button"
                onClick={() => logout()}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors text-destructive"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{t('signOut.label')}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {t('signOut.description')}
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}