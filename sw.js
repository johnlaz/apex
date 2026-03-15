const CACHE_NAME = 'apex-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-32.png',
  '/icon-64.png',
  '/icon-192.png',
  '/icon-256.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Always network-first for Anthropic API calls
  if (event.request.url.includes('anthropic.com') ||
      event.request.url.includes('nhtsa.gov') ||
      event.request.url.includes('clearbit.com') ||
      event.request.url.includes('vpic.')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
