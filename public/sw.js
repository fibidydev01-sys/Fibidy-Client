// ==========================================
// SERVICE WORKER - FIBIDY PWA
// V1 — Production Ready
//
// [TIDUR-NYENYAK v3.1 FIX]
// - Removed unused `isCacheValid` helper function (line 23 warning)
// - Removed unused `ttl` from destructure at line 109 (warning)
//
// [404-HARDENING — May 2026]
// Locale-aware skip rules. Pre-fix:
//   pathname.startsWith('/dashboard') only matches `/dashboard...`
//   Indonesian users on `/id/dashboard...` slipped through — got cached.
//   On next deploy with new chunk hashes, cached HTML pointed at dead
//   chunk URLs → 404 chunks → broken page (functionally a 404).
//
// Fix: introduce stripLocalePrefix() helper. shouldSkipCache() and
// getStoreRouteType() both run path matching against the stripped form.
// Locale list hardcoded (en|id) since SW is vanilla JS — no TS imports.
// Add this to LOCALES array if you ever expand i18n.
//
// Also expanded skip categories:
//   - /forgot-password → was missing, would cache password reset page
//   - /checkout/       → Stripe redirect flow, never cache
//   - /onboard/        → KYC connect flow, never cache
// ==========================================

const STATIC_CACHE = 'fibidy-static-v1';
const DYNAMIC_CACHE = 'fibidy-dynamic-v1';
const STORE_CACHE = 'fibidy-store-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
];

// [404-HARDENING] Hardcoded locales — SW is vanilla JS, can't import.
// Sync with src/i18n/routing.ts whenever you add a new locale.
const LOCALES = ['en', 'id'];

// TTL constants kept as reference — not currently wired up.
const TTL = {
  STORE_PAGE: 60 * 60 * 24 * 1000,
  STORE_PRODUCT: 60 * 60 * 1000,
  STORE_PRODUCTS_LIST: 60 * 60 * 4 * 1000,
};

function stampResponse(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', Date.now().toString());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ==========================================
// [404-HARDENING] LOCALE PREFIX STRIPPER
//
// Returns pathname with leading /{locale} removed if present.
//   /id/dashboard → /dashboard
//   /en/store/abc → /store/abc
//   /id           → /
//   /dashboard    → /dashboard (unchanged)
//
// Pattern requires the locale to be FOLLOWED by `/` or end-of-string,
// so paths like `/idea` (where 'id' is just a substring) don't get
// mangled.
// ==========================================
function stripLocalePrefix(pathname) {
  const localePattern = '^/(' + LOCALES.join('|') + ')(/.*)?$';
  const match = pathname.match(new RegExp(localePattern));
  if (!match) return pathname;
  return match[2] || '/';
}

function getStoreRouteType(pathname) {
  // [404-HARDENING] Strip locale before regex match so /id/store/abc
  // is treated the same as /store/abc.
  const stripped = stripLocalePrefix(pathname);

  if (/^\/store\/[^/]+\/products\/[^/]+/.test(stripped)) {
    return { isStore: true, ttl: TTL.STORE_PRODUCT };
  }
  if (/^\/store\/[^/]+\/products\/?$/.test(stripped)) {
    return { isStore: true, ttl: TTL.STORE_PRODUCTS_LIST };
  }
  if (/^\/store\/[^/]+/.test(stripped)) {
    return { isStore: true, ttl: TTL.STORE_PAGE };
  }
  return { isStore: false, ttl: 0 };
}

function shouldSkipCache(url) {
  const pathname = url.pathname;

  // [404-HARDENING] Locale-stripped path for app-route matching.
  // /api/ and /_next/ are never locale-prefixed, so we check those
  // against the raw pathname.
  const stripped = stripLocalePrefix(pathname);

  // OG/Twitter images are dynamic per-page — never cache
  if (pathname.includes('/opengraph-image') || pathname.includes('/twitter-image')) return true;

  // API routes (always at root, never locale-prefixed)
  if (pathname.startsWith('/api/')) return true;

  // Next.js internals
  if (pathname.startsWith('/_next/')) return true;

  // RSC requests carry stale chunks risk
  if (url.searchParams.has('_rsc')) return true;

  // [404-HARDENING] Auth-required app shell — locale-aware
  if (stripped.startsWith('/dashboard') || stripped.startsWith('/admin')) return true;
  if (stripped.startsWith('/login') || stripped.startsWith('/register')) return true;
  if (stripped.startsWith('/forgot-password')) return true;

  // [404-HARDENING] Stripe checkout redirect / KYC connect flow.
  // These pages depend on session_id query params — caching breaks them.
  if (stripped.startsWith('/checkout/')) return true;
  if (stripped.startsWith('/onboard/')) return true;

  return false;
}

// ==========================================
// INSTALL
// ==========================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v1...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ==========================================
// ACTIVATE
// ==========================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v1...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, DYNAMIC_CACHE, STORE_CACHE].includes(key))
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ==========================================
// FETCH
// ==========================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  if (shouldSkipCache(url)) {
    event.respondWith(fetch(request));
    return;
  }

  const { isStore } = getStoreRouteType(url.pathname);

  if (isStore) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const stamped = stampResponse(response.clone());
            caches.open(STORE_CACHE).then((cache) => cache.put(request, stamped));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(STORE_CACHE);
          const cached = await cache.match(request);

          if (cached) {
            console.log('[SW] Store cache hit:', url.pathname);
            return cached;
          }

          if (request.mode === 'navigate') {
            const home = await caches.match('/');
            return home || new Response('Offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' },
            });
          }

          return new Response('Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') {
            return caches.match('/').then((home) => {
              return home || new Response('Offline', {
                status: 503,
                headers: { 'Content-Type': 'text/plain' },
              });
            });
          }
          return new Response('Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});

// ==========================================
// PUSH NOTIFICATION
// ==========================================
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || 'Kamu punya notifikasi baru.',
    icon: '/icons/apple-touch-icon-192x192.png',
    badge: '/icons/apple-touch-icon-72x72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Fibidy', options)
  );
});

// ==========================================
// NOTIFICATION CLICK
// ==========================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

console.log('[SW] Service Worker v1 loaded - Fibidy Production Ready 🚀');
