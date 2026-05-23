// APEX Landing Page — Service Worker
// Scope: /apex/
const CACHE = 'apex-landing-v1';
const PRECACHE = [
  '/apex/',
  '/apex/index.html',
  '/apex/manifest.json',
  '/apex/icon-192.png',
  '/apex/icon-512.png',
  '/apex/icon-180.png',
  '/apex/icon-32.png',
  '/apex/icon-16.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only handle same-origin requests within /apex/
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/apex/app/')) return; // let app SW handle those
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match('/apex/index.html'));
    })
  );
});
