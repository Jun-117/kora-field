// KORA Field — the app MOVED to https://app.koracarenepal.com (Firebase Hosting, 2026-10). This service worker replaces the old one at
// koracarenepal.com/kora-field/: it takes over at once, deletes the old offline copy, unregisters itself and sends any open window to the
// new address. Data saved on this old address stays in this browser's storage (it is not deleted here).
const NEW_URL = 'https://app.koracarenepal.com/';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) await caches.delete(k);
    await self.clients.claim();
    const wins = await self.clients.matchAll({ type: 'window' });
    for (const w of wins) { try { await w.navigate(NEW_URL); } catch (err) { /* the page's own button still works */ } }
    await self.registration.unregister();
  })());
});
self.addEventListener('fetch', (e) => { if (e.request.mode === 'navigate') e.respondWith(fetch(e.request).catch(() => Response.redirect(NEW_URL, 302))); });
