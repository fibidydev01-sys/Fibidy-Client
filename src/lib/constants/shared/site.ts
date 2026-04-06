// ==========================================
// KONFIGURASI SITE
// ==========================================

export const siteConfig = {
  name: 'Fibidy',
  description: 'Platform situs online untuk UMKM Indonesia. Bikin situs sendiri dalam hitungan menit, tanpa ngoding.',
  tagline: 'Rumah digital untuk usahamu.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://fibidy.com',
  ogImage: '/og-image.png',

  // Kontak
  email: 'admin@fibidy.com',

  // Media sosial
  links: {
    instagram: 'https://instagram.com/fibidy_com',
    tiktok: 'https://tiktok.com/@fibidy.com',
    twitter: 'https://twitter.com/fibidy42581',
  },

  // SEO
  keywords: [
    'situs online',
    'toko online umkm',
    'jualan online',
    'platform umkm indonesia',
    'bikin situs sendiri',
    'indonesia',
  ],

  // Pembuat
  creator: 'Bayu Surya Pranata',
};