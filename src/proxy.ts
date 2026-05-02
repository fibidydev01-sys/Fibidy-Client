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
//  5. Fallback → delegate to next-intl middleware
//
// [404-HARDENING — May 2026]
// Two skip-list expansions to prevent middleware from intercepting
// public/* assets and causing 404s under specific edge cases:
//
//   1. MATCHER negative-lookahead now excludes:
//        xml | json | txt | map | woff | woff2 | ttf | css | js
//      (was only image extensions).
//      Effect: middleware never runs for these. Faster + safer.
//
//   2. HANDLER skip list now explicitly catches:
//        - /sitemap-N.xml (next-sitemap output, e.g. sitemap-0.xml)
//        - /manifest.json (PWA manifest)
//      Old code only matched exact /sitemap.xml. With sitemapSize=45000
//      and growing product catalog, sitemap-1.xml etc. would slip
//      through and risk next-intl rewrite → 404.
//
// All existing logic preserved verbatim — extraction, reserved subdomains,
// custom domain resolve, path-based store routing, next-intl delegation,
// DEBUG logging, x-custom-domain + x-tenant-slug headers.
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
 * inject our own. Covers `tokoA.fibidy.com/en/products` edge case —
 * without this, we'd get `/en/store/tokoA/en/products` (broken).
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
  // 1. SKIP: Static files, API routes, OG images, public assets
  //
  // [404-HARDENING] Expanded extension regex to include xml/json/txt/map.
  // Explicit catches added for /sitemap-N.xml (next-sitemap output) and
  // /manifest.json (PWA). The matcher config below ALSO excludes these,
  // so this is defense-in-depth — if matcher ever drifts, handler catches.
  // ==========================================
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('/opengraph-image') ||
    pathname.includes('/twitter-image') ||
    pathname === '/sitemap.xml' ||
    /^\/sitemap-\d+\.xml$/.test(pathname) || // [404-HARDENING] sitemap-0.xml, sitemap-1.xml, ...
    pathname === '/manifest.json' ||         // [404-HARDENING] PWA manifest
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
    const locale = routing.defaultLocale; // Phase 1: always 'en'
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
  // 4. PATH-BASED STORE ROUTING
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
  // 5. MAIN APP — delegate to next-intl
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
     * - public files (extension whitelist)
     *
     * [404-HARDENING] Extension list expanded from
     * (svg|png|jpg|jpeg|gif|webp|ico) to include:
     *   - xml  → sitemap-0.xml, sitemap-1.xml, ...
     *   - json → manifest.json
     *   - txt  → robots.txt (defense; was already exact-matched in handler)
     *   - map  → source maps
     *   - woff, woff2, ttf → font files
     *   - css, js → catches any root-level static like /sw.js
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|json|txt|map|woff|woff2|ttf|css|js)$).*)',
  ],
};

export default proxy;
