// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
    // ✅ CRITICAL FIX: Skip OG image routes
    pathname.includes('/opengraph-image') ||
    pathname.includes('/twitter-image') ||
    // ✅ Skip other Next.js special routes
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/server-sitemap') ||
    // Static file extensions
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf)$/)
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
    url.pathname = pathname === '/'
      ? `/store/${subdomain}`
      : `/store/${subdomain}${pathname}`;

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
      url.pathname = pathname === '/'
        ? `/store/${slug}`
        : `/store/${slug}${pathname}`;

      if (DEBUG) console.log('[Proxy] Custom domain rewrite:', url.pathname);

      const response = NextResponse.rewrite(url);
      response.headers.set('x-custom-domain', hostname);
      response.headers.set('x-tenant-slug', slug);
      return response;
    }
  }

  // ==========================================
  // 4. PASS THROUGH
  // Let page.tsx and guards handle auth
  // ==========================================
  if (DEBUG) console.log('[Proxy] Pass through');
  return NextResponse.next();
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