const CACHE_NAME = 'biblio-cache-v5';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

// Supprime les vieux caches pour faire de la place
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    // On ne met JAMAIS en cache les appels API (GitHub, Gemini)
    if (event.request.url.includes('api.github.com') || event.request.url.includes('generativelanguage.googleapis.com')) {
        return; 
    }

    // NOUVEAU : Stratégie "Network First" pour toujours avoir la dernière version de index.html
    event.respondWith(
        fetch(event.request).then((networkResponse) => {
            // Si Internet fonctionne, on donne la version fraîche et on met à jour le cache
            return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            });
        }).catch(() => {
            // Si pas d'Internet, on utilise le cache
            return caches.match(event.request);
        })
    );
});