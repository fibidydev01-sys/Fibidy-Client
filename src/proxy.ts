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
// constants instead of being inlined here. Three-way drift between
// proxy.ts, FE shared constant, and BE shared constant is now zero —
// they ALL point at the same definitions. Updating reserved entries
// or slug rules now requires touching ONE file (per side, mirrored).
//
// What this fix prevents:
//   - FE register form rejecting `admin` while proxy still routes
//     `admin.fibidy.com` to a tenant lookup
//   - Loose subdomain regex here permitting `a--b` while strict regex
//     in DTO rejects it (or vice versa)
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
// [VERCEL VIBES — May 2026]
// Step 5: edge-level auth gate. Reads the fibidy_auth cookie and
// makes routing decisions BEFORE the page renders. This eliminates the
// client-side flash where the login form would render briefly while
// `useAuthCheck` fetched /auth/status, then redirect to /dashboard.
//
// Rules:
//   - /dashboard/*     + no cookie  → 307 to /<locale>/login?from=...
//   - /login | /register | /forgot-password + cookie → 307 to /<locale>/dashboard/products
//   - /                + cookie     → 307 to /<locale>/dashboard/products
//   - /                + no cookie  → fall through (renders marketing page)
//
// Stale-cookie escape hatch: when /login is accessed with a `?reason=`
// query (set by the 401 handler in lib/api/client.ts when BE invalidates
// a session), the gate allows the user through even if the stale cookie
// is still in the browser. This breaks the otherwise-infinite loop
// between /dashboard (401s) and /login (gate redirects back).
//
// Open-redirect protection: when honoring `?from=` after a guest-only
// redirect, paths are validated as internal (start with `/` but not
// `//`). Anything else falls back to the default dashboard URL.
//
// Security: middleware is for routing UX, NOT a security boundary. The
// NestJS backend validates the cookie on every API call. CVE-2025-29927
// note: this codebase is on Next 16.1.1 (well above patched versions).
// ==========================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { isReservedSubdomain } from '@/lib/constants/shared/reserved-subdomains';
import { SLUG_REGEX } from '@/lib/constants/shared/slug.constants';

const PROD_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'fibidy.com';
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

    // Phase 4: shared constant — drift-proof with FE register + BE auth.
    if (isReservedSubdomain(subdomain)) {
      return null;
    }

    // Phase 4: shared regex — drift-proof with register.dto.ts + FE shared.
    // Strict version: no consecutive hyphens (was looser before).
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

/**
 * [VERCEL VIBES] Return the locale prefix present in `pathname`, or empty
 * string if none. Used to construct redirect URLs that preserve the
 * user's URL style (don't bounce a `/login` user to `/en/login` if their
 * URL didn't have the prefix to begin with).
 *
 * Examples:
 *   /login        → ''
 *   /en/login     → '/en'
 *   /en           → '/en'
 *   /en/          → '/en'
 *   /             → ''
 */
function getLocalePrefix(pathname: string): string {
  for (const loc of routing.locales) {
    if (pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)) {
      return `/${loc}`;
    }
  }
  return '';
}

/**
 * [VERCEL VIBES] Open-redirect guard. A `from` query is only honored if
 * it's a same-origin path: starts with `/` but not `//`.
 */
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
  // 5. AUTH GATE — [VERCEL VIBES — May 2026]
  //
  // Edge-level routing decisions for main app routes. Storefront routes
  // (handled in steps 2–4 above) are public regardless of auth state, so
  // they bypass this gate entirely.
  //
  // Cookie presence is "optimistic" — middleware can't validate session
  // without a BE round-trip (defeats the purpose). If the cookie is stale,
  // the dashboard's first API call will 401 → 401 handler redirects to
  // /login?reason=... → escape hatch below allows access.
  // ==========================================
  const cleanPath = stripLocalePrefix(pathname);
  const localePrefix = getLocalePrefix(pathname);
  const hasAuthCookie = request.cookies.has(AUTH_COOKIE_NAME);

  const isProtected = cleanPath.startsWith(PROTECTED_PREFIX);
  const isGuestOnly = GUEST_ONLY_PATHS.some(
    (p) => cleanPath === p || cleanPath.startsWith(`${p}/`),
  );
  const isRoot = cleanPath === '/' || cleanPath === '';

  // Stale-cookie escape hatch: allow access to /login when ?reason= is
  // set (e.g. session_expired, password_changed). Without this, a stale
  // cookie would loop the user back to /dashboard before BE can clear it.
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
