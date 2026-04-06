// ==========================================
// SEO CONFIGURATION
// Subdomain-Ready Architecture + Custom Domain Support
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
  // DEFAULT META
  // ==========================================
  defaultTitle: 'Fibidy — Platform Situs Online untuk UMKM Indonesia',
  titleTemplate: '%s | Fibidy',
  defaultDescription:
    'Bikin situs online sendiri dalam hitungan menit. Kelola produk, atur tampilan, edit sesuka hati — dimanapun, kapanpun. Gratis mulai.',

  // ==========================================
  // KEYWORDS
  // ==========================================
  defaultKeywords: [
    'situs online umkm',
    'platform umkm indonesia',
    'jualan online',
    'bikin situs online gratis',
    'toko online indonesia',
    'e-commerce umkm',
    'situs digital umkm',
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
  // LOCALE
  // ==========================================
  locale: 'id_ID',
  language: 'id',

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
    legalName: 'Fibidy Indonesia',
    url: PROD_URL,
    logo: `${PROD_URL}/logo.png`,
    foundingDate: '2026',
    address: {
      addressCountry: 'ID',
    },
    contactPoint: {
      contactType: 'customer service',
      availableLanguage: ['Indonesian', 'English'],
    },
    sameAs: [
      'https://instagram.com/fibidy_com',
      'https://tiktok.com/@fibidy.com',
      'https://twitter.com/fibidy42581',
    ],
  },
} as const;