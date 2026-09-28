const CACHE_NAME = 'sharep2p-cache-v1';

// Archivos que se guardarán para funcionar offline
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './manifest.json',
  './icons/web-app-manifest-192x192.png',
  './icons/web-app-manifest-512x512.png'
];

// 1. INSTALACIÓN: Guardar los archivos en la caché
self.addEventListener('install', (event) => {
  console.log('⚙️ Service Worker: Instalando y cacheando archivos...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('❌ Error al cachear:', error);
      })
  );
  // Forzar a que el SW tome el control inmediatamente
  self.skipWaiting(); 
});

// 2. ACTIVACIÓN: Limpiar cachés viejas si actualizas la app
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activado y listo');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tomar control de las páginas abiertas inmediatamente
  self.clients.claim();
});

// 3. INTERCEPTAR PETICIONES: Servir desde caché (Offline First)
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean GET (como los POST que haremos a Supabase luego)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si el archivo está en caché, lo devolvemos (¡Súper rápido!)
        if (response) {
          return response;
        }
        
        // Si no está en caché (ej. la API del QR), intentamos buscarlo en internet
        return fetch(event.request).then((networkResponse) => {
          // Opcional: Si es una imagen del QR, la podríamos cachear dinámicamente aquí
          return networkResponse;
        }).catch(() => {
          // Si no hay internet y no está en caché, mostramos un fallback básico
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
