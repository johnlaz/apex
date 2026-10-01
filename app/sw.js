// APEX — Service Worker
const CACHE_NAME = 'apex-v7';
const CACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './icon-512.png',
  './icon-192.png',
  './icon-256.png',
  './icon-64.png',
  './icon-32.png',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/zxing-js/0.19.1/zxing.min.js',
];

// ── INSTALL ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        CACHE_URLS.map(url =>
          cache.add(url).catch(err => console.warn('SW: could not cache', url, err))
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Never intercept API calls
  // (api.nhtsa.gov = live recall data: caching it would serve stale recalls forever)
  if (url.hostname === 'api.groq.com' ||
      url.hostname === 'vpic.nhtsa.dot.gov' ||
      url.hostname === 'api.nhtsa.gov' ||
      url.hostname === 'logo.clearbit.com') {
    return;
  }

  // Network-first for Google Fonts CSS
  if (url.hostname === 'fonts.googleapis.com') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Network-first for the app shell so a new deploy is never stuck behind an
  // old cached index.html (offline still works via the cached copy)
  if (event.request.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
