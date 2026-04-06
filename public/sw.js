// ==========================================
// SERVICE WORKER - FIBIDY PWA
// V1 — Production Ready
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

const TTL = {
  STORE_PAGE: 60 * 60 * 24 * 1000,
  STORE_PRODUCT: 60 * 60 * 1000,
  STORE_PRODUCTS_LIST: 60 * 60 * 4 * 1000,
};

function isCacheValid(response, ttl) {
  if (!response) return false;
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return false;
  return Date.now() - parseInt(cachedAt) < ttl;
}

function stampResponse(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', Date.now().toString());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function getStoreRouteType(pathname) {
  if (/^\/store\/[^/]+\/products\/[^/]+/.test(pathname)) {
    return { isStore: true, ttl: TTL.STORE_PRODUCT };
  }
  if (/^\/store\/[^/]+\/products\/?$/.test(pathname)) {
    return { isStore: true, ttl: TTL.STORE_PRODUCTS_LIST };
  }
  if (/^\/store\/[^/]+/.test(pathname)) {
    return { isStore: true, ttl: TTL.STORE_PAGE };
  }
  return { isStore: false, ttl: 0 };
}

function shouldSkipCache(url) {
  const pathname = url.pathname;
  if (pathname.includes('/opengraph-image') || pathname.includes('/twitter-image')) return true;
  if (pathname.startsWith('/api/')) return true;
  if (pathname.startsWith('/_next/')) return true;
  if (url.searchParams.has('_rsc')) return true;
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) return true;
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) return true;
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

  const { isStore, ttl } = getStoreRouteType(url.pathname);

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