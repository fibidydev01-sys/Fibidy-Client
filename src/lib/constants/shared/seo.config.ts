// ==========================================
// SEO CONFIGURATION
// Subdomain-Ready Architecture + Custom Domain Support
//
// [I18N MIGRATION] Phase 1 = English only.
// - All user-facing strings in English
// - locale: 'en_US', language: 'en'
// - availableLanguage: ['English'] (will expand in Phase 2)
// ==========================================

// Environment
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Production domain
const PROD_DOMAIN = 'fibidy.com';
const PROD_URL = 'https://fibidy.com';

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
   * Production subdomain: https://{slug}.fibidy.com
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
  // ==========================================
  reservedSubdomains: [
    // System
    'www', 'api', 'cdn', 'app', 'admin', 'dashboard',
    'static', 'assets', 'images', 'files', 'uploads',
    // Auth
    'login', 'register', 'logout', 'auth', 'oauth',
    // Marketing
    'blog', 'help', 'support', 'docs', 'status',
    'pricing', 'about', 'contact', 'terms', 'privacy',
    // Reserved
    'store', 'shop', 'toko', 'fibidy', 'test', 'demo',
    'null', 'undefined', 'root', 'system', 'mail', 'email',
    'ftp', 'ssh', 'cpanel', 'webmail', 'ns1', 'ns2',
  ] as string[],

  // ==========================================
  // DEFAULT META — ENGLISH
  // ==========================================
  defaultTitle: 'Fibidy — Sell Digital Products Online',
  titleTemplate: '%s | Fibidy',
  defaultDescription:
    'Launch your online store in minutes. Upload files, set prices, get paid via Stripe. Free forever, no commission.',

  // ==========================================
  // KEYWORDS — ENGLISH
  // ==========================================
  defaultKeywords: [
    'sell digital products',
    'online store platform',
    'digital downloads',
    'creator marketplace',
    'stripe payments',
    'digital product storefront',
    'no-code store builder',
    'fibidy',
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
      availableLanguage: ['English'],
    },
    sameAs: [
      'https://instagram.com/fibidy_com',
      'https://tiktok.com/@fibidy.com',
      'https://twitter.com/fibidy42581',
    ],
  },
} as const;