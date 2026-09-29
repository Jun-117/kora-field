// KORA Field — service worker: keeps the app itself on the phone so it opens with no internet.
// Data does not go through here (Firestore talks to Google directly and keeps its own offline copy).
const VERSION = 'kf-v0.10.1';
const SHELL = ['./', './index.html', './app.js', './logic.js', './desk.js', './route.js', './i18n.js', './geo.js', './bs.js', './capack.js', './cal.js', './sim.js', './styles.css', './manifest.webmanifest', './icon-180.png', './icon-512.png',
  './vendor/firebase-app.js', './vendor/firebase-auth.js', './vendor/firebase-firestore.js', './vendor/leaflet/leaflet.js', './vendor/leaflet/leaflet.css'];

self.addEventListener('install', (e) => {
  // cache:'reload' skips the browser HTTP cache so a new version really downloads new files
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))));
  // No automatic skipWaiting: an update must not reload the app while someone is typing a form.
});
self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
