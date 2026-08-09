// ==========================================
// STORE URL — Client-Safe Pure Functions
// File: src/lib/public/store-url.ts
//
// ONLY sync, client-safe functions live here.
// Server-side async functions (need next/headers) → store-url.server.ts
// ==========================================

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
// CLIENT-SIDE — sync, safe to import from Client Components.
// ==========================================

function isSubdomainRoutingClient(): boolean {
  if (typeof window === 'undefined') return false;
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
// Absolute URL — for links outside storefront (e.g. dashboard "Preview").
// Build-time env based, SSR and client agree, no window check needed.
// NOT affected by routing-mode detection.
// ==========================================
export function storeAbsoluteUrl(storeSlug: string, path: string = '/'): string {
  return seoConfig.getTenantUrl(storeSlug, path);
}

export function mainAppUrl(path: string): string {
  return seoConfig.getMainUrl(path);
}