// GYMCREAM — Service Worker
// Estratègia "network-first": sempre intenta agafar la versió MÉS
// RECENT per xarxa. Només fa servir la còpia guardada (cache) quan
// no hi ha connexió — mai serveix una còpia vella tenint internet.
const CACHE_NAME = 'gymcream-shell-v2'; // puja aquest número cada cop que canviïs fitxers del "shell"
const FITXERS_CACHE = ['index.html', 'manifest.json', 'Gymcream.png'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(FITXERS_CACHE); })
  );
  self.skipWaiting(); // activa la versió nova del SW com més aviat millor
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (claus) {
      return Promise.all(claus.filter(function (c) { return c !== CACHE_NAME; }).map(function (c) { return caches.delete(c); }));
    }).then(function () { return self.clients.claim(); }) // pren el control de les pestanyes obertes ja
  );
});

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);
  // Mai cachejar les crides a l'API (han de ser sempre en directe)
  if (url.hostname.indexOf('script.google.com') > -1) return;

  event.respondWith(
    fetch(event.request)
      .then(function (resposta) {
        const clon = resposta.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, clon); });
        return resposta;
      })
      .catch(function () {
        // Sense connexió: fem servir l'última còpia guardada
        return caches.match(event.request);
      })
  );
});
