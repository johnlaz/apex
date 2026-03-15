// APEX Service Worker — fixed for https://johnlaz.github.io/apex/
const CACHE = 'apex-v4';
const BASE  = '/apex/';

const APP_SHELL = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'favicon.ico',
  BASE + 'icon-32.png',
  BASE + 'icon-64.png',
  BASE + 'icon-192.png',
  BASE + 'icon-256.png',
];

const BYPASS = [
  'api.groq.com',
  'nhtsa.gov',
  'clearbit.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.allSettled(APP_SHELL.map(url => cache.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  if (BYPASS.some(s => url.includes(s))) return;

  // All navigation requests → serve index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(BASE + 'index.html').then(cached => {
          if (cached) return cached;
          return fetch(BASE + 'index.html').then(res => {
            cache.put(BASE + 'index.html', res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res && res.status === 200) {
          caches.open(CACHE).then(c => c.put(event.request, res.clone()));
        }
        return res;
      }).catch(() => caches.match(BASE + 'index.html'));
    })
  );
});
