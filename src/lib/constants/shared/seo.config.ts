// ==========================================
// SEO CONFIGURATION
// Subdomain-Ready Architecture + Custom Domain Support
//
// [I18N MIGRATION] Phase 1 = English only.
// - All user-facing strings in English
// - locale: 'en_US', language: 'en'
// - availableLanguage: ['English'] (will expand in Phase 2)
//
// [PHASE 4 — May 2026]
// 1. Hostname canonical → `www.fibidy.com` (Q14=B).
//    robots.txt + sitemap + OG image edge runtime already hardcode
//    `www`. Switching siteUrl here aligns the four canonical surfaces.
//    Subdomain hostname pattern (PROD_DOMAIN) stays as `fibidy.com`
//    because tenant subdomains are `slug.fibidy.com` (apex), not
//    `slug.www.fibidy.com`. Vercel handles 301 apex→www at the edge.
//
// 2. `reservedSubdomains` no longer maintains its own list — pulled
//    from `./reserved-subdomains` shared constant. Eliminates the
//    third copy of the list (proxy.ts + lib/constants/shared was
//    one drift surface; this was another). Single source of truth
//    on the FE side, mirrored from BE.
// ==========================================

import { RESERVED_SUBDOMAINS } from './reserved-subdomains';

// Environment
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Production domain
//   PROD_DOMAIN = apex (used for subdomain hostname pattern: slug.fibidy.com)
//   PROD_URL    = www-prefixed canonical (used for siteUrl, OG, JSON-LD @id)
const PROD_DOMAIN = 'fibidy.com';
const PROD_URL = 'https://www.fibidy.com';

export const seoConfig = {
  // ==========================================
  // SITE INFO
  // ==========================================
  siteName: 'Fibidy',
  siteUrl: IS_PRODUCTION ? PROD_URL : APP_URL,

  // ==========================================
  // DOMAIN CONFIGURATION
  // ==========================================
  domain: IS_PRODUCTION ? PROD_DOMAIN : APP_DOMAIN,
  protocol: IS_PRODUCTION ? 'https' : 'http',
  isProduction: IS_PRODUCTION,

  /**
   * Get tenant URL based on environment
   * Production subdomain: https://{slug}.fibidy.com   ← apex, NOT www
   * Production custom domain: https://{customDomain}
   * Development: http://localhost:3000/store/{slug}
   */
  getTenantUrl: (slug: string, path: string = '', customDomain?: string | null) => {
    const cleanPath = path.startsWith('/') ? path : path ? `/${path}` : '';

    if (IS_PRODUCTION && customDomain) {
      return `https://${customDomain}${cleanPath}`;
    }

    if (IS_PRODUCTION) {
      return `https://${slug}.${PROD_DOMAIN}${cleanPath}`;
    }
    return `${APP_URL}/store/${slug}${cleanPath}`;
  },

  /**
   * Get main platform URL
   */
  getMainUrl: (path: string = '') => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${IS_PRODUCTION ? PROD_URL : APP_URL}${cleanPath}`;
  },

  // ==========================================
  // RESERVED SUBDOMAINS
  //
  // Sourced from `./reserved-subdomains` (shared with proxy.ts and BE).
  // Spread into a string[] for backward compat with consumers expecting
  // an array. New consumers should import the Set directly via
  // `RESERVED_SUBDOMAINS` or use the `isReservedSubdomain(slug)` helper.
  // ==========================================
  reservedSubdomains: [...RESERVED_SUBDOMAINS] as string[],

  // ==========================================
  // DEFAULT META — ENGLISH
  //
  // [PHASE 4] Aligned with marketing voice (Phase 2 rewrite).
  // No more "Sell Digital Products" framing — Phase 1 reality is
  // catalog + WhatsApp ordering. Marketing route overrides via
  // `generateMetadata` for finer control.
  // ==========================================
  defaultTitle: 'Fibidy — Open your store. Sell today.',
  titleTemplate: '%s | Fibidy',
  defaultDescription:
    'Launch your storefront in minutes. Build your catalog, share your link, and let customers order via WhatsApp. Free during beta — for Indonesian creators and small businesses.',

  // ==========================================
  // KEYWORDS — ENGLISH
  // ==========================================
  defaultKeywords: [
    'fibidy',
    'umkm online store',
    'whatsapp ordering',
    'storefront builder indonesia',
    'no-code online store',
    'subdomain storefront',
    'custom domain storefront',
    'sell online indonesia',
  ] as string[],

  // ==========================================
  // SOCIAL
  // ==========================================
  twitterHandle: '@fibidy42581',

  // ==========================================
  // IMAGES
  // ==========================================
  defaultOgImage: '/opengraph-image.png',
  logoUrl: '/logo.png',

  // ==========================================
  // LOCALE — ENGLISH (Phase 1)
  // Will expand in Phase 2 (alternates.languages)
  // ==========================================
  locale: 'en_US',
  language: 'en',

  // ==========================================
  // THEME
  // ==========================================
  themeColor: '#ec4899',
  backgroundColor: '#ffffff',

  // ==========================================
  // ORGANIZATION (JSON-LD)
  // ==========================================
  organization: {
    name: 'Fibidy',
    legalName: 'Fibidy',
    url: PROD_URL,
    logo: `${PROD_URL}/logo.png`,
    foundingDate: '2026',
    address: {
      addressCountry: 'ID',
    },
    contactPoint: {
      contactType: 'customer service',
      availableLanguage: ['English', 'Indonesian'],
    },
    sameAs: [
      'https://instagram.com/fibidy_com',
      'https://tiktok.com/@fibidy.com',
      'https://twitter.com/fibidy42581',
    ],
  },
} as const;
