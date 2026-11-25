// Service worker: caches the app shell so the app opens even on a weak connection,
// and shows an offline message when there is no internet.
const CACHE = 'iberry-shell-v1';
const SHELL = ['./', 'index.html', 'manifest.json', 'offline.html',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // never touch Google's requests
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() =>
      caches.match('offline.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
