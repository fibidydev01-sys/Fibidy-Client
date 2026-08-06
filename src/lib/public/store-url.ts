// ==========================================
// STORE URL — Pure Functions
// NO 'use client' — aman diimport di Server Component
// Hook version: lib/public/use-store-urls.ts
// ==========================================

// [E1 FIX PARITY] ROOT_DOMAIN diimpor dari constants.ts (single source of
// truth — sama seperti proxy.ts) alih-alih derive ulang dari env var di
// sini. Versi lama skip prioritas #2 (derive dari NEXT_PUBLIC_APP_URL),
// jadi bisa drift dari domain proxy.ts kalau cuma APP_URL yang di-set.
import { ROOT_DOMAIN } from '@/lib/constants/shared/constants';
import { seoConfig } from '@/lib/constants/shared/seo.config';

function isLocalOrPreviewHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.vercel.app')
  );
}

function isSubdomainRouting(): boolean {
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV === 'production';
  }
  const hostname = window.location.hostname;
  if (isLocalOrPreviewHost(hostname)) return false;
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

// Absolute link to the tenant's real subdomain (or custom domain) — for
// links rendered outside the storefront (e.g. dashboard "Preview"), where a
// relative storeUrl() would resolve against the wrong origin. Delegates to
// seoConfig.getTenantUrl — the same domain-resolution logic already used
// for canonical/OG URLs — instead of re-deriving it, so this never drifts
// from that. Build-time env based (no window check), so SSR and client agree.
export function storeAbsoluteUrl(storeSlug: string, path: string = '/'): string {
  return seoConfig.getTenantUrl(storeSlug, path);
}

// Inverse of storeAbsoluteUrl — a link back to the main app, correct even when rendered on a tenant subdomain/custom domain where a relative path would 404. Delegates to seoConfig.getMainUrl for the same reason as storeAbsoluteUrl above.
export function mainAppUrl(path: string): string {
  return seoConfig.getMainUrl(path);
}
