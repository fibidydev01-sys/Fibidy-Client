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
// Contact, Social, Password). Uses `onBack` prop to return to settings
// list, same as other sections.
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
import { ArrowLeft, Check, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/shared/utils';

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
    // next-intl's router.replace() understands the `locale` option and
    // will re-render the route tree with the new locale's messages.
    // `pathname` from @/i18n/navigation is the locale-stripped path, so
    // this is safe to pass back verbatim — the router re-prefixes it.
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label={t('backButton')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Languages className="h-5 w-5" />
            {t('title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('subtitle')}
          </p>
        </div>
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
  );
}
