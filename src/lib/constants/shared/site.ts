// ==========================================
// SITE CONFIGURATION
//
// [I18N MIGRATION] Phase 1 = English only.
// ==========================================

export const siteConfig = {
  name: 'Fibidy',
  description:
    'Sell digital products with your own online store. Launch in minutes, get paid via Stripe, no commission.',
  tagline: 'Your digital storefront, ready in minutes.',
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
    'sell digital products',
    'online store',
    'digital downloads',
    'creator platform',
    'stripe storefront',
    'no-code store',
  ],

  // Creator
  creator: 'Bayu Surya Pranata',
};