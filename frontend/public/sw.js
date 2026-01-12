const CACHE_VERSION = 'v1';
const CACHE_NAME = `pokeranking-${CACHE_VERSION}`;
const RUNTIME_CACHE = `pokeranking-runtime-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/offline.html',
  '/favicon/web-app-manifest-192x192.png',
  '/favicon/web-app-manifest-512x512.png',
];

// Install event - cache critical assets
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
            cacheName !== RUNTIME_CACHE &&
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

// Fetch event - simple caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Only handle same-origin and specific CDN requests
  const isSameOrigin = url.origin === self.location.origin;
  const isCDN =
    url.hostname === 'fonts.cdnfonts.com' ||
    url.hostname === 'res.cloudinary.com' ||
    url.hostname === 'ik.imagekit.io';

  if (!isSameOrigin && !isCDN) {
    return;
  }

  // CacheFirst for static assets and CDN resources
  if (
    url.pathname.startsWith('/_next/static/') ||
    isCDN ||
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|avif|ico|woff|woff2)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(request).then((response) => {
            if (!response || !response.ok) return response;
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
            return response;
          })
        );
      })
    );
    return;
  }

  // NetworkFirst for everything else (HTML, etc.)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || caches.match('/offline.html');
        });
      })
  );
});
