/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.fibidy.com',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  outDir: 'public',
  sitemapSize: 45000,
  changefreq: 'weekly',
  priority: 0.7,

  exclude: [
    // Auth
    '/login',
    '/register',
    '/forgot-password',
    // Dashboard
    '/dashboard',
    '/dashboard/*',
    // Admin
    '/admin',
    '/admin/*',
    // API
    '/api/*',
    // Internal Next.js
    '/_not-found',
    '/opengraph-image',
    '/twitter-image',
    // Server sitemap (dynamic, handle sendiri)
    '/server-sitemap-index.xml',
    '/server-sitemap/*',
    // Store (handle via server-sitemap)
    '/store',
    '/store/*',
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: ['/', '/store/', '/legal/'],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/_next/',
          '/login',
          '/register',
          '/forgot-password',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/store/', '/legal/'],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/login',
          '/register',
        ],
      },
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

    // Tier 1 — Landing utama
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    }
    // Tier 2 — Legal index
    else if (path === '/legal') {
      priority = 0.6;
      changefreq = 'monthly';
    }
    // Tier 3 — Legal pages
    else if (path.startsWith('/legal/')) {
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