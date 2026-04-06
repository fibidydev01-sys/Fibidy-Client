// ==========================================
// STORE URL — Pure Functions
// NO 'use client' — aman diimport di Server Component
// Hook version: lib/public/use-store-urls.ts
// ==========================================

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'fibidy.com';

function isSubdomainRouting(): boolean {
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV === 'production';
  }
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return false;
  if (hostname.includes('.vercel.app')) return false;
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) return false;
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) return true;
  return true;
}

function getStoreBasePath(storeSlug: string): string {
  return isSubdomainRouting() ? '' : `/store/${storeSlug}`;
}

export function storeUrl(storeSlug: string, path: string = '/'): string {
  const basePath = getStoreBasePath(storeSlug);
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