// ==========================================
// NEXT-INTL ROUTING CONFIGURATION
// File: src/i18n/routing.ts
//
// Phase 1 = English only.
// localePrefix 'as-needed' → `/` still works (no URL changes for users/SEO).
// Phase 2 will add 'id' and can switch to 'always' if needed.
// ==========================================

import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en'] as const,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];