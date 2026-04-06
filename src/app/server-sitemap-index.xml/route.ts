// ============================================================================
// FILE: src/app/server-sitemap-index.xml/route.ts
// PURPOSE: Sitemap index untuk semua toko aktif
// URL: /server-sitemap-index.xml
// ============================================================================

import { getServerSideSitemapIndex } from 'next-sitemap';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const SITE_URL = 'https://www.fibidy.com';

export async function GET() {
  try {
    // Fetch total tenant untuk hitung jumlah halaman sitemap
    const res = await fetch(`${API_URL}/tenants/sitemap?page=1&limit=1`, {
      next: { revalidate: 3600 }, // revalidate tiap 1 jam
    });

    if (!res.ok) {
      // Kalau API error, return sitemap index kosong daripada error
      return getServerSideSitemapIndex([]);
    }

    const data = await res.json();
    const totalPages = data?.meta?.totalPages ?? 1;

    // Generate URL sitemap per page
    const sitemaps = Array.from({ length: totalPages }, (_, i) => {
      const page = i + 1;
      return `${SITE_URL}/server-sitemap/${page}`;
    });

    return getServerSideSitemapIndex(sitemaps);
  } catch {
    // Fallback — jangan crash, return kosong
    return getServerSideSitemapIndex([]);
  }
}