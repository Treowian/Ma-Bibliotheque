const CACHE_NAME = 'biblio-cache-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.png'
];

// Installation : on met les fichiers statiques en cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
    // 🚨 Règle d'or : On ne met JAMAIS en cache les appels vers les API externes
    if (event.request.url.includes('api.github.com') || event.request.url.includes('generativelanguage.googleapis.com')) {
        return; 
    }

    // Pour le reste (HTML, icône), on cherche dans le cache d'abord, sinon on télécharge
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});