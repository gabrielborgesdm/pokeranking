const CACHE_VERSION = 'v6';
const CACHE_NAME = `pokeranking-${CACHE_VERSION}`;
const API_CACHE_NAME = `pokemon-api-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/favicon/web-app-manifest-192x192.png',
  '/favicon/web-app-manifest-512x512.png',
];

// Install event - cache only offline page and icons
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Clean old pokeranking caches
          if (
            cacheName !== CACHE_NAME &&
            cacheName.startsWith('pokeranking-')
          ) {
            return caches.delete(cacheName);
          }
          // Clean old pokemon-api caches
          if (
            cacheName !== API_CACHE_NAME &&
            cacheName.startsWith('pokemon-api-')
          ) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - handle offline fallback and Pokemon API caching
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Handle Pokemon API requests (network-first with cache fallback)
  // Match /pokemon endpoint (exact) - excludes /pokemon/search, /pokemon/:id, etc.
  if (url.pathname === '/pokemon' || url.pathname.endsWith('/pokemon')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Clone and cache successful responses
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            return cache.match(request);
          });
      })
    );
    return;
  }

  const isSameOrigin = url.origin === self.location.origin;
  const isNavigationRequest = request.mode === 'navigate' || request.destination === 'document';

  if (!isSameOrigin) {
    return;
  }

  // Cache Next.js static assets (JS/CSS chunks) - cache-first since they're immutable
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).catch(() => {
            // Asset not cached and offline - return empty response to avoid iOS crash
            return new Response('', { status: 408 });
          });
        });
      })
    );
    return;
  }

  // Only handle navigation requests for pages
  if (!isNavigationRequest) {
    return;
  }

  // All pages - network-first with cache fallback for offline support
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => {
          return cache.match(request);
        });
    })
  );
});
