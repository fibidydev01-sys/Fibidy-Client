// ============================================================================
// FILE: src/app/server-sitemap/[page]/route.ts
// PURPOSE: Sitemap dinamis per halaman — list semua toko aktif
// URL: /server-sitemap/1, /server-sitemap/2, dst
// ============================================================================

import { getServerSideSitemap } from 'next-sitemap';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const SITE_URL = 'https://www.fibidy.com';
const LIMIT = 200; // tenant per halaman sitemap

interface TenantSitemapItem {
  slug: string;
  updatedAt: string;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ page: string }> },
) {
  const { page } = await params;
  const pageNumber = parseInt(page, 10) || 1;

  try {
    const res = await fetch(
      `${API_URL}/tenants/sitemap?page=${pageNumber}&limit=${LIMIT}`,
      {
        next: { revalidate: 3600 }, // revalidate tiap 1 jam
      },
    );

    if (!res.ok) {
      return getServerSideSitemap([]);
    }

    const data = await res.json();
    const tenants: TenantSitemapItem[] = data?.data ?? [];

    // Generate sitemap entries per toko
    // Setiap toko punya 4 URL: home, products, about, contact
    const fields = tenants.flatMap((tenant) => {
      const lastmod = new Date(tenant.updatedAt).toISOString();
      const baseUrl = `${SITE_URL}/store/${tenant.slug}`;

      return [
        {
          loc: baseUrl,
          lastmod,
          changefreq: 'daily' as const,
          priority: 0.8,
        },
        {
          loc: `${baseUrl}/products`,
          lastmod,
          changefreq: 'daily' as const,
          priority: 0.7,
        },
        {
          loc: `${baseUrl}/about`,
          lastmod,
          changefreq: 'weekly' as const,
          priority: 0.5,
        },
        {
          loc: `${baseUrl}/contact`,
          lastmod,
          changefreq: 'monthly' as const,
          priority: 0.4,
        },
      ];
    });

    return getServerSideSitemap(fields);
  } catch {
    // Fallback — jangan crash
    return getServerSideSitemap([]);
  }
}