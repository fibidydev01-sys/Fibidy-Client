// ==========================================
// STORE URL — Pure Functions
// File: src/lib/public/store-url.ts
//
// [BREADCRUMB FIX — 2026-08-09]
// Root cause: fungsi lama isSubdomainRouting() di cabang SERVER menebak
// dari `process.env.NODE_ENV === 'production'`, bukan dari sinyal request
// yang sesungguhnya. Karena proxy.ts bisa rewrite dari SUBDOMAIN
// (demo123.fibidy.com) ATAU dari PATH-BASED (/store/demo123) ke struktur
// route App Router yang SAMA PERSIS (/[locale]/store/[slug]/...), server
// tidak pernah bisa membedakan dua kasus itu hanya dari NODE_ENV — yang
// nilainya selalu sama ('production') terlepas dari jalur mana yang
// sebenarnya dipakai. Akibatnya breadcrumb "Products" di halaman detail
// produk selalu generate href basePath-kosong (`/products`) di production,
// padahal untuk mode path-based (studio preview via www.fibidy.com/store/...)
// harusnya `/store/{slug}/products`. Href yang salah itu lalu di-prefix
// locale oleh next-intl middleware → `/id/products` → 404, karena route
// itu tidak pernah ada di App Router.
//
// Fix: proxy.ts sekarang inject header `x-routing-mode` ('subdomain' atau
// 'path') di setiap jalur rewrite (subdomain, custom domain, path-based).
// Versi SERVER di file ini baca header itu lewat headers() dari
// next/headers — bukan menebak lagi. Ini butuh fungsi jadi ASYNC karena
// headers() di Next.js 15+ wajib di-await.
//
// Versi CLIENT (dipakai oleh useStoreUrls hook dan semua pemanggilan
// langsung dari Client Component) TIDAK berubah — window.location.hostname
// selalu tersedia sinkron di sana, jadi tetap sync seperti sebelumnya.
//
// PENTING — kapan pakai yang mana:
//   - Dipanggil dari Server Component (async function, tidak ada
//     'use client' di file/parent-nya)? → pakai versi *Server (async,
//     WAJIB di-await, jangan panggil inline di JSX — hitung ke variabel
//     dulu sebelum return).
//   - Dipanggil dari Client Component ('use client', hook, event handler,
//     useMemo, dst)? → pakai versi biasa (storeUrl, productUrl,
//     productsUrl, storeHomeUrl) — sync, tidak berubah dari sebelumnya.
//
// Hook version (client): lib/public/use-store-urls.ts — TIDAK PERLU
// diubah, dia tetap manggil versi sync di bawah ini.
// ==========================================

import { headers } from 'next/headers';
import { ROOT_DOMAIN } from '@/lib/constants/shared/constants';
import { seoConfig } from '@/lib/constants/shared/seo.config';

function isLocalOrPreviewHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.vercel.app')
  );
}

// ==========================================
// CLIENT-SIDE — sync, tidak berubah dari versi sebelumnya.
// Dipakai oleh useStoreUrls hook dan semua pemanggilan langsung dari
// Client Component. window.location.hostname selalu tersedia sinkron
// di titik eksekusi ini.
// ==========================================

function isSubdomainRoutingClient(): boolean {
  if (typeof window === 'undefined') {
    // Fallback aman kalau fungsi sync ini kepanggil dari Server Component
    // secara tidak sengaja (harusnya pakai versi *Server di bawah).
    // Asumsikan path-based — TIDAK PERNAH nebak dari NODE_ENV lagi, itu
    // akar bug yang sedang difix di file ini.
    return false;
  }
  const hostname = window.location.hostname;
  if (isLocalOrPreviewHost(hostname)) return false;
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) return false;
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) return true;
  return false;
}

function getStoreBasePathClient(storeSlug: string): string {
  return isSubdomainRoutingClient() ? '' : `/store/${storeSlug}`;
}

export function storeUrl(storeSlug: string, path: string = '/'): string {
  const basePath = getStoreBasePathClient(storeSlug);
  const normalizedPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}` || '/';
}

export function productUrl(storeSlug: string, productId: string): string {
  return storeUrl(storeSlug, `/products/${productId}`);
}

export function productsUrl(
  storeSlug: string,
  params?: Record<string, string | undefined>
): string {
  const base = storeUrl(storeSlug, '/products');
  if (!params) return base;

  const filteredParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') filteredParams[key] = value;
  });

  if (Object.keys(filteredParams).length === 0) return base;
  return `${base}?${new URLSearchParams(filteredParams).toString()}`;
}

export function storeHomeUrl(storeSlug: string): string {
  return storeUrl(storeSlug, '/');
}

// ==========================================
// SERVER-SIDE — async, WAJIB di-await. Baca header 'x-routing-mode'
// yang di-inject proxy.ts (lihat proxy.ts step 2/3/4), bukan menebak
// dari NODE_ENV. Ini fungsi yang harus dipakai dari Server Component.
// ==========================================

async function isSubdomainRoutingServer(): Promise<boolean> {
  try {
    const h = await headers();
    return h.get('x-routing-mode') === 'subdomain';
  } catch {
    // headers() throw kalau dipanggil di luar request context
    // (mis. generateStaticParams, atau build-time). Fallback aman:
    // asumsikan path-based.
    return false;
  }
}

async function getStoreBasePathServer(storeSlug: string): Promise<string> {
  const isSubdomain = await isSubdomainRoutingServer();
  return isSubdomain ? '' : `/store/${storeSlug}`;
}

export async function storeUrlServer(storeSlug: string, path: string = '/'): Promise<string> {
  const basePath = await getStoreBasePathServer(storeSlug);
  const normalizedPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}` || '/';
}

export async function productUrlServer(storeSlug: string, productId: string): Promise<string> {
  return storeUrlServer(storeSlug, `/products/${productId}`);
}

export async function productsUrlServer(
  storeSlug: string,
  params?: Record<string, string | undefined>
): Promise<string> {
  const base = await storeUrlServer(storeSlug, '/products');
  if (!params) return base;

  const filteredParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') filteredParams[key] = value;
  });

  if (Object.keys(filteredParams).length === 0) return base;
  return `${base}?${new URLSearchParams(filteredParams).toString()}`;
}

export async function storeHomeUrlServer(storeSlug: string): Promise<string> {
  return storeUrlServer(storeSlug, '/');
}

// ==========================================
// Absolute link to the tenant's real subdomain (or custom domain) — for
// links rendered outside the storefront (e.g. dashboard "Preview"), where a
// relative storeUrl() would resolve against the wrong origin. Delegates to
// seoConfig.getTenantUrl — the same domain-resolution logic already used
// for canonical/OG URLs — instead of re-deriving it, so this never drifts
// from that. Build-time env based (no window check), so SSR and client agree.
//
// NOT affected by the breadcrumb fix above — this never went through
// isSubdomainRouting() in the first place.
// ==========================================
export function storeAbsoluteUrl(storeSlug: string, path: string = '/'): string {
  return seoConfig.getTenantUrl(storeSlug, path);
}

// Inverse of storeAbsoluteUrl — a link back to the main app, correct even when rendered on a tenant subdomain/custom domain where a relative path would 404. Delegates to seoConfig.getMainUrl for the same reason as storeAbsoluteUrl above.
export function mainAppUrl(path: string): string {
  return seoConfig.getMainUrl(path);
}