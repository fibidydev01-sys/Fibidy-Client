// src/proxy.ts
//
// ==========================================
// PHASE 1 I18N: Composed with next-intl middleware.
//
// ROUTING FLOW:
//  1. Skip static/api/OG/sitemap
//  2. Subdomain (tokoA.fibidy.com) → rewrite to /en/store/tokoA
//  3. Custom domain → rewrite to /en/store/{slug}
//  4. [NEW] Path-based (/store/{slug}) → rewrite to /en/store/{slug}
//     This handles localhost dev + fibidy.com/store/{slug} access,
//     mirroring the subdomain experience so internal file structure
//     stays unified under [locale]/store/[slug]/.
//  5. Fallback → delegate to next-intl middleware
//
// UNCHANGED:
//  - All subdomain extraction logic
//  - Reserved subdomains list
//  - Custom domain resolution via /api/tenant/resolve-domain
//  - Skip rules for static/api/OG/sitemap
//  - x-custom-domain + x-tenant-slug headers
//  - DEBUG logging
//  - Matcher config
// ==========================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const PROD_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'fibidy.com';
const DEBUG = process.env.NODE_ENV === 'development';

const RESERVED_SUBDOMAINS = [
  'www', 'api', 'cdn', 'app', 'admin', 'dashboard',
  'static', 'assets', 'images', 'files', 'uploads',
  'login', 'register', 'logout', 'auth', 'oauth',
  'blog', 'help', 'support', 'docs', 'status',
  'pricing', 'about', 'contact', 'terms', 'privacy',
  'store', 'shop', 'toko', 'fibidy', 'test', 'demo',
  'null', 'undefined', 'root', 'system', 'mail', 'email',
];

// ==========================================
// NEXT-INTL MIDDLEWARE INSTANCE
// Handles locale detection / redirect for main-domain (non-tenant) routes.
// ==========================================

const intlMiddleware = createMiddleware(routing);

function extractSubdomain(hostname: string): string | null {
  if (
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    hostname.includes('.vercel.app')
  ) {
    return null;
  }

  if (hostname.endsWith(`.${PROD_DOMAIN}`)) {
    const subdomain = hostname.replace(`.${PROD_DOMAIN}`, '');

    if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
      return null;
    }

    if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(subdomain)) {
      return subdomain;
    }
  }

  return null;
}

function isCustomDomain(hostname: string): boolean {
  return (
    !hostname.includes('localhost') &&
    !hostname.includes('127.0.0.1') &&
    !hostname.includes('.vercel.app') &&
    hostname !== PROD_DOMAIN &&
    hostname !== `www.${PROD_DOMAIN}` &&
    !hostname.endsWith(`.${PROD_DOMAIN}`)
  );
}

async function resolveCustomDomain(
  hostname: string,
  request: NextRequest
): Promise<string | null> {
  try {
    const apiUrl = new URL('/api/tenant/resolve-domain', request.url);
    apiUrl.searchParams.set('hostname', hostname);

    const response = await fetch(apiUrl.toString(), {
      headers: { 'x-internal-request': 'true' },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.slug || null;
  } catch (error) {
    if (DEBUG) console.error('[Proxy] Custom domain resolve failed:', error);
    return null;
  }
}

/**
 * Defensive: strip a leading locale prefix from the pathname before we
 * inject our own. Covers the edge case where a user types
 * `tokoA.fibidy.com/en/products` — without this, we'd end up with
 * `/en/store/tokoA/en/products` (double-locale, broken route).
 *
 * With Phase 1 having only 'en', this is mostly future-proofing.
 */
function stripLocalePrefix(pathname: string): string {
  for (const loc of routing.locales) {
    if (pathname.startsWith(`/${loc}/`)) {
      return pathname.substring(loc.length + 1);
    }
    if (pathname === `/${loc}`) {
      return '/';
    }
  }
  return pathname;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  if (DEBUG) {
    console.log('[Proxy]', hostname, pathname);
  }

  // ==========================================
  // 1. SKIP: Static files, API routes, OG images
  // ==========================================
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('/opengraph-image') ||
    pathname.includes('/twitter-image') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/server-sitemap') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf)$/)
  ) {
    if (DEBUG && (pathname.includes('/opengraph-image') || pathname.includes('/twitter-image'))) {
      console.log('[Proxy] Skipping OG image route:', pathname);
    }
    return NextResponse.next();
  }

  // ==========================================
  // 2. SUBDOMAIN ROUTING — inject locale into rewrite path
  // ==========================================
  const subdomain = extractSubdomain(hostname);

  if (subdomain) {
    const url = request.nextUrl.clone();
    const locale = routing.defaultLocale; // Phase 1: always 'en'
    const cleanPath = stripLocalePrefix(pathname);

    url.pathname = cleanPath === '/'
      ? `/${locale}/store/${subdomain}`
      : `/${locale}/store/${subdomain}${cleanPath}`;

    if (DEBUG) console.log('[Proxy] Subdomain rewrite:', url.pathname);
    return NextResponse.rewrite(url);
  }

  // ==========================================
  // 3. CUSTOM DOMAIN ROUTING — inject locale into rewrite path
  // ==========================================
  if (isCustomDomain(hostname)) {
    const slug = await resolveCustomDomain(hostname, request);

    if (slug) {
      const url = request.nextUrl.clone();
      const locale = routing.defaultLocale; // Phase 1: always 'en'
      const cleanPath = stripLocalePrefix(pathname);

      url.pathname = cleanPath === '/'
        ? `/${locale}/store/${slug}`
        : `/${locale}/store/${slug}${cleanPath}`;

      if (DEBUG) console.log('[Proxy] Custom domain rewrite:', url.pathname);

      const response = NextResponse.rewrite(url);
      response.headers.set('x-custom-domain', hostname);
      response.headers.set('x-tenant-slug', slug);
      return response;
    }
  }

  // ==========================================
  // 4. [NEW] PATH-BASED STORE ROUTING
  //
  // Main domain (including localhost in dev) hitting /store/{slug}
  // gets rewritten to /{locale}/store/{slug} so that:
  //   - Dev experience mirrors prod subdomain rewrite
  //   - User URL stays clean (no /en visible)
  //   - Next.js matches the correct [locale]/store/[slug] route
  // ==========================================
  if (pathname.startsWith('/store/')) {
    const url = request.nextUrl.clone();
    const locale = routing.defaultLocale; // Phase 1: always 'en'
    const cleanPath = stripLocalePrefix(pathname);

    url.pathname = `/${locale}${cleanPath}`;

    if (DEBUG) console.log('[Proxy] Path-based store rewrite:', url.pathname);
    return NextResponse.rewrite(url);
  }

  // ==========================================
  // 5. MAIN APP — delegate to next-intl middleware
  // Handles locale detection and (if localePrefix='always') the `/` → `/en` redirect.
  // With localePrefix='as-needed', this is effectively a no-op for the default locale.
  // ==========================================
  if (DEBUG) console.log('[Proxy] Delegating to next-intl middleware');
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

export default proxy;