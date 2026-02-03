const CACHE_VERSION = 'v2';
const CACHE_NAME = `pokeranking-${CACHE_VERSION}`;
const API_CACHE_NAME = `pokemon-api-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/offline.html',
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
            // Return cached response when offline
            return cache.match(request);
          });
      })
    );
    return;
  }

  // Only handle same-origin HTML navigation requests for offline fallback
  const isSameOrigin = url.origin === self.location.origin;
  const isNavigationRequest = request.mode === 'navigate' || request.destination === 'document';

  if (!isSameOrigin || !isNavigationRequest) {
    return;
  }

  // Skip offline fallback for pokedex - it handles offline state itself
  if (url.pathname.startsWith('/pokedex')) {
    return;
  }

  // Network-only with offline fallback for HTML pages
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match('/offline.html');
      })
  );
});
