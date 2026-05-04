// ==========================================
// NEXT-INTL REQUEST CONFIGURATION
// File: src/i18n/request.ts
//
// Loads and merges all namespaced message files per locale.
// next-intl v4 REQUIRES `locale` field in the return value.
//
// File is referenced by next.config.ts via createNextIntlPlugin.
//
// [MARKETING REBUILD — May 2026]
// Added `marketing` namespace (15th file). marketing.json drives
// all copy in the (marketing) route group — header, hero, problem,
// features bento, pricing cards, how-it-works, FAQ, final CTA, footer.
// Without this registration, getTranslations({namespace:'marketing.*'})
// silently returns the key path instead of the translated string.
// ==========================================

import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Merge all 15 namespaced message files at top level.
  // Each file contributes its own top-level keys (no nesting under namespace).
  const messages = {
    ...(await import(`../../messages/${locale}/common.json`)).default,
    ...(await import(`../../messages/${locale}/auth.json`)).default,
    ...(await import(`../../messages/${locale}/admin.json`)).default,
    ...(await import(`../../messages/${locale}/dashboard.json`)).default,
    ...(await import(`../../messages/${locale}/studio.json`)).default,
    ...(await import(`../../messages/${locale}/settings.json`)).default,
    ...(await import(`../../messages/${locale}/discover.json`)).default,
    ...(await import(`../../messages/${locale}/store.json`)).default,
    ...(await import(`../../messages/${locale}/checkout.json`)).default,
    ...(await import(`../../messages/${locale}/legal.json`)).default,
    ...(await import(`../../messages/${locale}/validation.json`)).default,
    ...(await import(`../../messages/${locale}/toast.json`)).default,
    ...(await import(`../../messages/${locale}/error.json`)).default,
    ...(await import(`../../messages/${locale}/og.json`)).default,
    ...(await import(`../../messages/${locale}/marketing.json`)).default,
  };

  return {
    locale,
    messages,
  };
});
