// GYMCREAM — Service Worker mínim
// Cacheja només l'"esquelet" de l'app (HTML/logo), NO les dades del
// Sheet — aquestes sempre es demanen en directe quan hi ha connexió.
const CACHE_NAME = 'gymcream-shell-v1';
const FITXERS_CACHE = ['index.html', 'manifest.json', 'Gymcream.png'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(FITXERS_CACHE); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (claus) {
      return Promise.all(claus.filter(function (c) { return c !== CACHE_NAME; }).map(function (c) { return caches.delete(c); }));
    })
  );
});

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);
  // Mai cachejar les crides a l'API (han de ser sempre en directe)
  if (url.hostname.indexOf('script.google.com') > -1) return;

  event.respondWith(
    caches.match(event.request).then(function (resposta) {
      return resposta || fetch(event.request);
    })
  );
});
