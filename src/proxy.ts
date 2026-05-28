// src/proxy.ts
//
// ==========================================
// PHASE 1 I18N: Composed with next-intl middleware.
//
// ROUTING FLOW:
//  1. Skip static/api/OG/sitemap/manifest
//  2. Subdomain (tokoA.fibidy.com) → rewrite to /en/store/tokoA
//  3. Custom domain → rewrite to /en/store/{slug}
//  4. Path-based (/store/{slug}) → rewrite to /en/store/{slug}
//  5. Auth gate → redirect based on cookie + route category    [VERCEL VIBES — May 2026]
//  6. Fallback → delegate to next-intl middleware
//
// [PHASE 4 — May 2026]
// Reserved-subdomain list + slug regex now imported from shared
// constants instead of being inlined here.
//
// [404-HARDENING — May 2026]
// Two skip-list expansions to prevent middleware from intercepting
// public/* assets and causing 404s under specific edge cases.
//
// [VERCEL VIBES — May 2026]
// Step 5: edge-level auth gate.
//
// [SPRINT 4 — E1 FIX: NEXT_PUBLIC_ROOT_DOMAIN vs NEXT_PUBLIC_APP_URL drift]
// PROD_DOMAIN sekarang di-derive dari ROOT_DOMAIN yang ada di constants.ts.
// ROOT_DOMAIN memprioritaskan NEXT_PUBLIC_ROOT_DOMAIN (explicit override),
// lalu fallback ke derive dari NEXT_PUBLIC_APP_URL, lalu hardcode 'fibidy.com'.
// Satu env var sebagai source of truth — tidak ada lagi kemungkinan drift.
// ==========================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { isReservedSubdomain } from '@/lib/constants/shared/reserved-subdomains';
import { SLUG_REGEX } from '@/lib/constants/shared/slug.constants';
// [E1 FIX] Import ROOT_DOMAIN dari constants — single source of truth
import { ROOT_DOMAIN } from '@/lib/constants/shared/constants';

// [E1 FIX] Ganti dari:
//   const PROD_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'fibidy.com';
// Menjadi ROOT_DOMAIN yang sudah handle priority chain di constants.ts
const PROD_DOMAIN = ROOT_DOMAIN;
const DEBUG = process.env.NODE_ENV === 'development';

// ==========================================
// [VERCEL VIBES] AUTH GATE CONSTANTS
// ==========================================

const AUTH_COOKIE_NAME = 'fibidy_auth';
const PROTECTED_PREFIX = '/dashboard';
const GUEST_ONLY_PATHS = ['/login', '/register', '/forgot-password'] as const;

// ==========================================
// NEXT-INTL MIDDLEWARE INSTANCE
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

    if (isReservedSubdomain(subdomain)) {
      return null;
    }

    if (SLUG_REGEX.test(subdomain.toLowerCase())) {
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

function getLocalePrefix(pathname: string): string {
  for (const loc of routing.locales) {
    if (pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)) {
      return `/${loc}`;
    }
  }
  return '';
}

function isInternalPath(path: string | null): path is string {
  if (!path) return false;
  return path.startsWith('/') && !path.startsWith('//');
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  if (DEBUG) {
    console.log('[Proxy]', hostname, pathname);
  }

  // ==========================================
  // 1. SKIP: Static files, API routes, OG images, public assets
  // ==========================================
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('/opengraph-image') ||
    pathname.includes('/twitter-image') ||
    pathname === '/sitemap.xml' ||
    /^\/sitemap-\d+\.xml$/.test(pathname) ||
    pathname === '/manifest.json' ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/server-sitemap') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|xml|json|txt|map)$/)
  ) {
    if (DEBUG && (pathname.includes('/opengraph-image') || pathname.includes('/twitter-image'))) {
      console.log('[Proxy] Skipping OG image route:', pathname);
    }
    return NextResponse.next();
  }

  // ==========================================
  // 2. SUBDOMAIN ROUTING
  // ==========================================
  const subdomain = extractSubdomain(hostname);

  if (subdomain) {
    const url = request.nextUrl.clone();
    const locale = routing.defaultLocale;
    const cleanPath = stripLocalePrefix(pathname);

    url.pathname = cleanPath === '/'
      ? `/${locale}/store/${subdomain}`
      : `/${locale}/store/${subdomain}${cleanPath}`;

    if (DEBUG) console.log('[Proxy] Subdomain rewrite:', url.pathname);
    return NextResponse.rewrite(url);
  }

  // ==========================================
  // 3. CUSTOM DOMAIN ROUTING
  // ==========================================
  if (isCustomDomain(hostname)) {
    const slug = await resolveCustomDomain(hostname, request);

    if (slug) {
      const url = request.nextUrl.clone();
      const locale = routing.defaultLocale;
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
  // 4. PATH-BASED STORE ROUTING
  // ==========================================
  if (pathname.startsWith('/store/')) {
    const url = request.nextUrl.clone();
    const locale = routing.defaultLocale;
    const cleanPath = stripLocalePrefix(pathname);

    url.pathname = `/${locale}${cleanPath}`;

    if (DEBUG) console.log('[Proxy] Path-based store rewrite:', url.pathname);
    return NextResponse.rewrite(url);
  }

  // ==========================================
  // 5. AUTH GATE — [VERCEL VIBES — May 2026]
  // ==========================================
  const cleanPath = stripLocalePrefix(pathname);
  const localePrefix = getLocalePrefix(pathname);
  const hasAuthCookie = request.cookies.has(AUTH_COOKIE_NAME);

  const isProtected = cleanPath.startsWith(PROTECTED_PREFIX);
  const isGuestOnly = GUEST_ONLY_PATHS.some(
    (p) => cleanPath === p || cleanPath.startsWith(`${p}/`),
  );
  const isRoot = cleanPath === '/' || cleanPath === '';

  const hasAuthReason =
    cleanPath === '/login' && request.nextUrl.searchParams.has('reason');

  // Rule A: protected route + no cookie → /login
  if (isProtected && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = `${localePrefix}/login`;
    url.search = '';
    url.searchParams.set('from', pathname);
    if (DEBUG) console.log('[Proxy] Auth gate: protected + no cookie →', url.pathname);
    return NextResponse.redirect(url);
  }

  // Rule B: guest-only route + cookie present → dashboard
  if (isGuestOnly && hasAuthCookie && !hasAuthReason) {
    const url = request.nextUrl.clone();
    const from = request.nextUrl.searchParams.get('from');
    url.pathname = isInternalPath(from)
      ? from
      : `${localePrefix}/dashboard/products`;
    url.search = '';
    if (DEBUG) console.log('[Proxy] Auth gate: guest-only + authed →', url.pathname);
    return NextResponse.redirect(url);
  }

  // Rule C: root + cookie present → dashboard
  if (isRoot && hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = `${localePrefix}/dashboard/products`;
    url.search = '';
    if (DEBUG) console.log('[Proxy] Auth gate: root + authed →', url.pathname);
    return NextResponse.redirect(url);
  }

  // ==========================================
  // 6. MAIN APP — delegate to next-intl
  // ==========================================
  if (DEBUG) console.log('[Proxy] Delegating to next-intl middleware');
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|json|txt|map|woff|woff2|ttf|css|js)$).*)',
  ],
};

export default proxy;
