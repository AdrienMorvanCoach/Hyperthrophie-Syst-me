// Service Worker — Hypertrophie Système Femmes
// ⚠ Incrémenter CACHE_VERSION à chaque mise à jour pour forcer le rechargement chez toutes les utilisatrices
const CACHE_VERSION = 'hsf-v1.0';
const CACHE_FILES = ['/', '/index.html'];

// Installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(CACHE_FILES))
  );
  self.skipWaiting();
});

// Activation — supprime les anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — Network First : réseau d'abord, cache en fallback (hors ligne)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
