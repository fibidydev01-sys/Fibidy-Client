'use client';

// ==========================================
// LANGUAGE SECTION
// File: src/components/dashboard/settings/language.tsx
//
// [LAYER 8 — 2026-04-19]
// Settings section for language/locale picker.
//
// Behavior: INSTANT SWAP on radio click.
// - Uses `useRouter` + `usePathname` from `@/i18n/navigation` (NOT
//   `next/navigation`) — the next-intl wrapper preserves the pathname
//   while swapping the locale segment and re-renders the route tree
//   with messages from the new locale.
// - No backend call. Language preference is URL-driven, so it persists
//   across sessions via the URL itself (bookmarks, history, etc). If
//   a user wants to persist a preference across devices, they'll need
//   to hit the same URL again — acceptable tradeoff for Phase 1.
// - Current selection is derived from `useLocale()`.
//
// Styling convention matches sibling section components (Hero, About,
// Contact, Social, Password) — max-w-2xl shell + WizardNav sticky bottom
// bar, back-only (no Save: selection applies instantly, nothing to save).
//
// [UI/UX CONSISTENCY AUDIT]
//   1. Back button moved off the top-inline position into the shared
//      sticky-bottom WizardNav (hideSaveButton) — same "thumb reach"
//      placement as every other settings section.
//   2. Fixed en->id switching one way only ("stuck on id"): switching TO
//      the default locale (en) produces a bare/unprefixed URL under
//      localePrefix:'as-needed'. If the NEXT_LOCALE cookie still said
//      'id' from a previous switch, the middleware treated the bare URL
//      as ambiguous and re-detected 'id' from the stale cookie, redirecting
//      straight back — confirmed against the dev middleware. Setting the
//      cookie client-side before navigating closes that race.
//
// JSON keys used:
//   - `settings.language.title`
//   - `settings.language.subtitle`
//   - `settings.language.infoAlert`
//   - `settings.language.currentLanguage`
//   - `settings.language.backButton`
//   - `settings.language.options.en.{label, native, description}`
//   - `settings.language.options.id.{label, native, description}`
// ==========================================

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { Check, Languages } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import { cn } from '@/lib/shared/utils';

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year — matches next-intl's own default

interface LanguageSectionProps {
  onBack: () => void;
}

export function LanguageSection({ onBack }: LanguageSectionProps) {
  const t = useTranslations('settings.language');
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleSelect = (nextLocale: string) => {
    if (nextLocale === currentLocale) return;
    // Sync the cookie before navigating — see [UI/UX CONSISTENCY AUDIT] above.
    // eslint-disable-next-line react-hooks/immutability -- browser cookie write in a click handler, not render
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto w-full">
      <div className="flex-1 pb-20 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Languages className="h-5 w-5" />
            {t('title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('subtitle')}
          </p>
        </div>

        {/* Info alert */}
        <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {t('infoAlert')}
        </div>

        {/* Current language */}
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
          {t('currentLanguage')}
        </div>

        {/* Locale options */}
        <div className="space-y-2">
          {routing.locales.map((locale) => {
            const isActive = locale === currentLocale;
            return (
              <Card
                key={locale}
                className={cn(
                  'cursor-pointer transition-colors',
                  isActive
                    ? 'border-primary/50 bg-primary/5'
                    : 'hover:border-foreground/20 hover:bg-muted/30',
                )}
                onClick={() => handleSelect(locale)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(locale);
                  }
                }}
                aria-pressed={isActive}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="font-medium">
                      {t(`options.${locale}.native`)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {t(`options.${locale}.description`)}
                    </div>
                  </div>
                  {isActive && (
                    <div className="flex items-center gap-2 text-primary">
                      <Check className="h-5 w-5" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <WizardNav onBack={onBack} hideSaveButton />
    </div>
  );
}
