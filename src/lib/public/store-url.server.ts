// ==========================================
// STORE URL — Server-Only Async Functions
// File: src/lib/public/store-url.server.ts
//
// WAJIB di-await. Gunakan HANYA dari Server Components.
// Client Components → pakai store-url.ts (sync).
//
// 'server-only' di baris pertama memastikan Next.js throw build error
// yang jelas jika file ini masuk ke Client Component bundle secara
// tidak sengaja — lebih baik daripada runtime error yang membingungkan.
//
// Tidak ada import ROOT_DOMAIN atau isLocalOrPreviewHost di sini —
// isSubdomainRoutingServer() hanya butuh headers(), tidak perlu
// inspeksi hostname secara langsung.
// ==========================================

import 'server-only';
import { headers } from 'next/headers';

async function isSubdomainRoutingServer(): Promise<boolean> {
  try {
    const h = await headers();
    return h.get('x-routing-mode') === 'subdomain';
  } catch {
    // headers() throws outside request context (e.g. generateStaticParams,
    // build-time). Safe fallback: assume path-based routing.
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