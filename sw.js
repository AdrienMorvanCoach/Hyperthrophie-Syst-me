// Service Worker — Hypertrophie Système Femmes
// Version : à incrémenter à chaque mise à jour pour forcer le rechargement
const CACHE_VERSION = 'hsf-v1.0';
const CACHE_FILES = [
  '/',
  '/index.html',
];

// Installation — mise en cache des fichiers
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      return cache.addAll(CACHE_FILES);
    })
  );
  // Forcer l'activation immédiate (pas d'attente)
  self.skipWaiting();
});

// Activation — supprimer les anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      );
    })
  );
  // Prendre le contrôle immédiatement
  self.clients.claim();
});

// Fetch — stratégie Network First (réseau d'abord, cache en fallback)
// Garantit que l'utilisatrice a toujours la dernière version si elle est en ligne
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la réponse réseau est OK, mettre à jour le cache
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_VERSION).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si hors ligne, utiliser le cache
        return caches.match(event.request).then(cached => {
          return cached || new Response('Hors ligne — données en cache disponibles', {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});
