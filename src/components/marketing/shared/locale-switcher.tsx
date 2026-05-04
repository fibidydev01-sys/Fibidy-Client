'use client';

// ==========================================
// LOCALE SWITCHER
// File: src/components/marketing/shared/locale-switcher.tsx
//
// Footer-only locale switcher (per Vercel/Linear/Stripe convention —
// header stays clean of meta-actions). Switching swaps the locale
// segment in the URL without losing the current pathname/search.
//
// next-intl v4: useRouter().replace() with `{ locale }` option
// reuses the current path and re-resolves the locale segment.
// localePrefix is 'as-needed' so:
//   en → '/' (no prefix), '/pricing' (no prefix)
//   id → '/id', '/id/pricing'
// useRouter handles the rewriting transparently.
//
// Why client component: useRouter from next-intl/navigation is a
// client-only hook. Footer is a server component, so this island
// is the smallest possible client boundary.
// ==========================================

import { Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTransition } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { routing } from '@/i18n/routing';

const LOCALE_LABEL_KEYS: Record<string, string> = {
  en: 'en',
  id: 'id',
};

export function LocaleSwitcher() {
  const t = useTranslations('marketing.footer.localeSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (next: string) => {
    if (next === locale) return;
    startTransition(() => {
      // next-intl handles prefix logic; passing { locale } is enough.
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t('label')}
          disabled={isPending}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Globe className="h-3.5 w-3.5" aria-hidden />
          <span className="uppercase">{t(LOCALE_LABEL_KEYS[locale] ?? 'en')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleSelect(loc)}
            disabled={loc === locale}
            className="text-sm"
          >
            {t(LOCALE_LABEL_KEYS[loc] ?? loc)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
