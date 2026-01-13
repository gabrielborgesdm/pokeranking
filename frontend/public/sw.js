const CACHE_VERSION = 'v1';
const CACHE_NAME = `pokeranking-${CACHE_VERSION}`;

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
          if (
            cacheName !== CACHE_NAME &&
            cacheName.startsWith('pokeranking-')
          ) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - only provide offline fallback, no caching
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Only handle same-origin HTML navigation requests for offline fallback
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isNavigationRequest = request.mode === 'navigate' || request.destination === 'document';

  if (!isSameOrigin || !isNavigationRequest) {
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
