const CACHE_NAME = 'universe-imani-v5';
const assets = ['index.html', 'style.css', 'script.js', 'Imany.jpg'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
});

self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});