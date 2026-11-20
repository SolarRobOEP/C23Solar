/* C23 Solar — offline support for the installed app.
 * Pages are fetched fresh when online and fall back to the cached copy offline;
 * scripts and styles likewise come fresh when online; images are served from the cache first.
 * Bump VERSION whenever any of the files below change so visitors get the update. */
const VERSION = 'c23-v9';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './manifest.webmanifest',
  './assets/c23-solar-logo.svg',
  './assets/c23-solar-lockup.svg',
  './assets/favicon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/photos/install-home-evening.jpg',
  './assets/photos/install-blue-sky.jpg',
  './assets/photos/install-red-roof.jpg',
  './assets/photos/install-barn.jpg',
  './assets/photos/install-rooflights.jpg',
  './assets/photos/install-slate.jpg',
  './assets/photos/install-clay-tiles.jpg',
  './assets/photos/install-grey-tiles.jpg',
  './assets/photos/install-large-roof.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // fonts etc. go straight to the network

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  // Scripts, styles and the manifest: fresh from the network when online, so an update
  // reaches visitors on their next load; the saved copy is only an offline fallback.
  if (/\.(js|css|webmanifest)$/.test(url.pathname)) {
    event.respondWith(
      fetch(req)
        .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});
