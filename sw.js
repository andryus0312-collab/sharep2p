const CACHE_NAME = 'sharep2p-cache-v2'; // Subimos a v2 para forzar actualización

// Rutas exactas según tu estructura de carpetas
const urlsToCache = [
  './',
  './index.html',
  './js/app.js',          // <-- Tu JS en su carpeta
  './css/styles.css',     // <-- Tu CSS en su carpeta (si la carpeta se llama 'styles', cámbialo aquí)
  './manifest.json',
  './icons/web-app-manifest-192x192.png',
  './icons/web-app-manifest-512x512.png'
];

// 1. INSTALACIÓN
self.addEventListener('install', (event) => {
  console.log('⚙️ Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((error) => console.error('❌ Error al cachear:', error))
  );
  self.skipWaiting(); 
});

// 2. ACTIVACIÓN
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

// 3. INTERCEPTAR (OFFLINE FIRST)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) return response; // ¡Sirve desde caché si existe!
        return fetch(event.request).catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
