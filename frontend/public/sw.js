// Minimal Service Worker for PWA
const CACHE_NAME = 'exitus-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Logic for offline support would go here
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
