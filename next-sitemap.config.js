/** @type {import('next-sitemap').IConfig} */
//
// ==========================================
// [404-HARDENING — May 2026]
//
// Pre-fix: exclude patterns like '/login', '/dashboard/*' only matched
// the default-locale URLs (e.g., /login). With localePrefix='as-needed',
// Indonesian URLs are /id/login, /id/dashboard/*, etc. — those were
// NOT matched by the exclude list and ended up in sitemap-0.xml.
//
// Effect: Google would index /id/dashboard/products (auth-required),
// crawl them, get redirected to /id/login, and report soft-404 / poor
// UX signals. Same for /id/admin/*, /id/checkout/*, etc.
//
// Fix: list both /xxx and /id/xxx variants explicitly. Also added
// /checkout/* and /onboard/* (Stripe + KYC flows — never indexable).
// robots.txt disallow list mirrors the same expansion so honest bots
// respect the rules even before sitemap regeneration.
//
// When you add a new locale (e.g., 'ms' for Malay), duplicate every
// '/id/...' entry as '/ms/...'. Yes it's verbose — next-sitemap doesn't
// support glob alternation natively. The verbosity is intentional: each
// path is auditable in code review.
// ==========================================

module.exports = {
  siteUrl: 'https://www.fibidy.com',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  outDir: 'public',
  sitemapSize: 45000,
  changefreq: 'weekly',
  priority: 0.7,

  exclude: [
    // ── Auth (en + id) ────────────────────────────────────────────
    '/login',
    '/id/login',
    '/register',
    '/id/register',
    '/forgot-password',
    '/id/forgot-password',

    // ── Dashboard (en + id) ───────────────────────────────────────
    '/dashboard',
    '/dashboard/*',
    '/id/dashboard',
    '/id/dashboard/*',

    // ── Admin (en + id) ───────────────────────────────────────────
    '/admin',
    '/admin/*',
    '/id/admin',
    '/id/admin/*',

    // ── Checkout flow (en + id) ───────────────────────────────────
    // Stripe redirect target — depends on ?session_id=... query.
    // Indexing these would create a flood of dead URLs in Google.
    '/checkout/cancel',
    '/checkout/success',
    '/id/checkout/cancel',
    '/id/checkout/success',

    // ── Onboard (en + id) ─────────────────────────────────────────
    // Stripe Connect / KYC return URL — same reason as checkout.
    '/onboard',
    '/onboard/*',
    '/id/onboard',
    '/id/onboard/*',

    // ── API ──────────────────────────────────────────────────────
    '/api/*',

    // ── Internal Next.js ─────────────────────────────────────────
    '/_not-found',
    '/opengraph-image',
    '/twitter-image',

    // ── Server sitemap (dynamic, handled separately) ─────────────
    '/server-sitemap-index.xml',
    '/server-sitemap/*',

    // ── Store (handled via server-sitemap with full product data) ─
    '/store',
    '/store/*',
    '/id/store',
    '/id/store/*',
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/store/',
          '/legal/',
          // [404-HARDENING] Allow Indonesian public surfaces.
          '/id/',
          '/id/store/',
          '/id/legal/',
        ],
        disallow: [
          // Dashboard
          '/dashboard/',
          '/id/dashboard/',
          // Admin
          '/admin/',
          '/id/admin/',
          // API
          '/api/',
          // Next.js internals
          '/_next/',
          // Auth
          '/login',
          '/id/login',
          '/register',
          '/id/register',
          '/forgot-password',
          '/id/forgot-password',
          // Checkout / Onboard
          '/checkout/',
          '/id/checkout/',
          '/onboard/',
          '/id/onboard/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/store/',
          '/legal/',
          '/id/',
          '/id/store/',
          '/id/legal/',
        ],
        disallow: [
          '/dashboard/',
          '/id/dashboard/',
          '/admin/',
          '/id/admin/',
          '/api/',
          '/login',
          '/id/login',
          '/register',
          '/id/register',
          '/checkout/',
          '/id/checkout/',
          '/onboard/',
          '/id/onboard/',
        ],
      },
      // Aggressive scrapers — full block
      { userAgent: 'AhrefsBot', disallow: '/' },
      { userAgent: 'SemrushBot', disallow: '/' },
      { userAgent: 'MJ12bot', disallow: '/' },
      { userAgent: 'DotBot', disallow: '/' },
      { userAgent: 'BLEXBot', disallow: '/' },
      { userAgent: 'PetalBot', disallow: '/' },
      { userAgent: 'DataForSeoBot', disallow: '/' },
    ],
    additionalSitemaps: [
      'https://www.fibidy.com/server-sitemap-index.xml',
    ],
  },

  transform: async (config, path) => {
    let priority = config.priority;
    let changefreq = config.changefreq;

    // Tier 1 — Landing utama (en + id)
    if (path === '/' || path === '/id') {
      priority = 1.0;
      changefreq = 'daily';
    }
    // Tier 2 — Legal index (en + id)
    else if (path === '/legal' || path === '/id/legal') {
      priority = 0.6;
      changefreq = 'monthly';
    }
    // Tier 3 — Legal pages (en + id)
    else if (path.startsWith('/legal/') || path.startsWith('/id/legal/')) {
      priority = 0.4;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};
