// ==========================================
// I18N ROUTING CONFIG
// File: src/i18n/routing.ts
//
// Central config for next-intl routing — locales list, default locale,
// and prefix strategy. Imported by:
//   - middleware.ts (locale negotiation)
//   - i18n/request.ts (message loading)
//   - i18n/navigation.ts (locale-aware Link/redirect/useRouter wrappers)
//
// [LAYER 8 CHANGE — 2026-04-19]
// Added 'id' to the locales array. Users can now switch between English
// and Bahasa Indonesia via the Language picker in Dashboard > Settings >
// Preferences > Language. Default remains 'en' — new visitors land on
// English unless middleware detects a locale preference from Accept-Language
// or they explicitly navigate to /id/*.
//
// `localePrefix: 'as-needed'` means:
//   - /dashboard/products      → English (no prefix for default locale)
//   - /id/dashboard/products   → Indonesian (prefix required)
// ==========================================

import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'id'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
