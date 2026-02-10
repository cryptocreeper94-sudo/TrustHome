const CACHE_NAME = 'trusthome-v1';
const OFFLINE_URL = '/';

const PRECACHE_URLS = [
  '/',
  '/app',
  '/manifest.json',
  '/assets/images/icon.png',
  '/assets/images/favicon.png',
  '/assets/images/splash-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/webhooks/')) {
    return;
  }

  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok && !url.pathname.startsWith('/api/')) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone).catch(() => {});
        });
      }
      return response;
    }).catch(() => {
      return caches.match(event.request).then((cached) => {
        return cached || caches.match(OFFLINE_URL);
      });
    })
  );
});
