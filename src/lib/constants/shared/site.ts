// ==========================================
// SITE CONFIGURATION
//
// [POLISH v15.4 — May 2026]
// Refreshed to match seoConfig.defaultDescription verbatim. Two
// sources of truth (site.ts + seo.config.ts) now agree on what
// Fibidy is. Drop "Sell digital products / Stripe" Phase 1 framing
// in favor of Phase 4 catalog + WhatsApp ordering.
//
// "Free forever to start" replaces beta framing — Free plan IS
// permanent (subscription page priceNote: "Forever free").
// ==========================================

export const siteConfig = {
  name: 'Fibidy',
  description:
    'Open your storefront in 5 minutes. Build your catalog, share your link, and let customers order via WhatsApp. Free forever to start, for Indonesian creators and small businesses.',
  tagline: 'Open your store. Sell today.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://fibidy.com',
  ogImage: '/og-image.png',

  // Contact
  email: 'admin@fibidy.com',

  // Social
  links: {
    instagram: 'https://instagram.com/fibidy_com',
    tiktok: 'https://tiktok.com/@fibidy.com',
    twitter: 'https://twitter.com/fibidy42581',
  },

  // SEO
  keywords: [
    'fibidy',
    'umkm online store',
    'whatsapp ordering',
    'storefront builder indonesia',
    'no-code online store',
    'subdomain storefront',
    'custom domain storefront',
    'sell online indonesia',
  ],

  // Creator
  creator: 'Bayu Surya Pranata',
};
