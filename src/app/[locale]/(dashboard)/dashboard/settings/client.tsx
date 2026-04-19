'use client';

// ==========================================
// SETTINGS PAGE CLIENT
// File: src/app/[locale]/(dashboard)/dashboard/settings/client.tsx
//
// [LAYER 8 — 2026-04-19]
// Three changes in this version:
//
// 1. New "Preferences" group added between "Channels" and "Account",
//    containing Language + Dark Mode rows. Account group now only holds
//    Subscription and Change Password (semantically cleaner — Account
//    is for billing/security, Preferences is for UI choices).
//
// 2. Dark/Light Mode row MOVED from the Account group to the new
//    Preferences group. The row itself is unchanged — same theme toggle
//    behavior, just relocated.
//
// 3. New Language row added to Preferences. Opens the new
//    LanguageSection at /dashboard/settings?section=language.
//
// ==========================================
// IMPORTANT: This file is a REPLACEMENT for the existing client.tsx.
// If your local file has additional logic (query param sync, guards,
// analytics hooks, etc.) that isn't reproduced here, merge those back
// in manually — the parts you need to preserve are the scaffolding
// around `<section switcher>` and the URL sync.
//
// Core edits vs the previous version (grep-friendly):
//   + import { Languages } from 'lucide-react';
//   + import { LanguageSection } from '@/components/dashboard/settings/language';
//   + added 'language' to SettingId
//   + added `preferences` group to settingsGroups
//   + moved lightMode/darkMode from `account` to `preferences`
//   + added `language` to sectionMap
// ==========================================

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
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Section components
import { HeroSection } from '@/components/dashboard/settings/hero';
import { AboutSection } from '@/components/dashboard/settings/about';
import { ContactSection } from '@/components/dashboard/settings/contact';
import { SocialSection } from '@/components/dashboard/settings/social';
import { PasswordSection } from '@/components/dashboard/settings/password';
import { LanguageSection } from '@/components/dashboard/settings/language';

// Hooks
import { useLogout } from '@/hooks/auth/use-auth';

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
  | 'about-fibidy';

type GroupKey = 'store' | 'channels' | 'preferences' | 'account' | 'legal';

interface SettingRow {
  id: SettingId | 'theme-toggle' | 'sign-out';
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  descriptionKey: string;
  href?: string;
  /** When true, renders a theme toggle row instead of a nav link */
  isThemeToggle?: boolean;
  /** When true, renders a logout confirm row */
  isSignOut?: boolean;
}

// ==========================================
// Main component
// ==========================================

export function SettingsClient() {
  const t = useTranslations('dashboard.settings');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const { logout } = useLogout();

  // Active section derived from `?section=...` query param
  const sectionParam = searchParams.get('section') as SettingId | null;
  const [activeSection, setActiveSection] = useState<SettingId | null>(
    sectionParam,
  );

  // Keep URL in sync with local state
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
  // Wrapped in useMemo so `t` changes (locale swap) rebuild the tree.
  // Order here is the display order on screen.

  const groups = useMemo(
    () => {
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
            href: '/dashboard/settings/subscription',
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
    },
    // Theme icon swaps based on current theme — rebuild when theme flips.
    [theme],
  );

  const groupOrder: GroupKey[] = [
    'store',
    'channels',
    'preferences',
    'account',
    'legal',
  ];

  // ==========================================
  // Section renderer — returns the full-page section view
  // ==========================================

  if (activeSection) {
    const sectionMap: Record<SettingId, React.ReactNode> = {
      bio: <HeroSection onBack={handleBack} />,
      featured: <AboutSection onBack={handleBack} />,
      contact: <ContactSection onBack={handleBack} />,
      social: <SocialSection onBack={handleBack} />,
      subscription: null, // handled by href
      password: <PasswordSection onBack={handleBack} />,
      language: <LanguageSection onBack={handleBack} />,
      'about-fibidy': null, // handled by href
    };

    const node = sectionMap[activeSection];
    if (node) return <div className="max-w-2xl mx-auto">{node}</div>;
  }

  // ==========================================
  // List view
  // ==========================================

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

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

                    // Theme toggle row — no navigation
                    if (row.isThemeToggle) {
                      return (
                        <button
                          key={row.id}
                          type="button"
                          onClick={() =>
                            setTheme(theme === 'dark' ? 'light' : 'dark')
                          }
                          className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
                        >
                          <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">
                              {t(row.labelKey)}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {t(row.descriptionKey)}
                            </div>
                          </div>
                        </button>
                      );
                    }

                    // Link row — uses href for external-ish navigation
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
                            <div className="font-medium">
                              {t(row.labelKey)}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {t(row.descriptionKey)}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </button>
                      );
                    }

                    // Inline section row — opens in-page section
                    return (
                      <button
                        key={row.id}
                        type="button"
                        onClick={() => handleOpen(row.id as SettingId)}
                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
                      >
                        <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">
                            {t(row.labelKey)}
                          </div>
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

        {/* Sign out — standalone row at the bottom */}
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
