const CACHE_NAME = 'sharep2p-cache-v3';

const urlsToCache = [
  './',
  './index.html',
  './js/app.js',
  './css/styles.css',
  './manifest.json',
  './icons/web-app-manifest-192x192.png',
  './icons/web-app-manifest-512x512.png'
];

// 1. INSTALACIÓN
self.addEventListener('install', (event) => {
  console.log('⚙️ Service Worker: Instalando (v3)...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((error) => console.error('❌ Error al cachear:', error))
  );
  self.skipWaiting();
});

// 2. ACTIVACIÓN (borra cachés viejas, incluida la v2)
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activado (v3)');
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((name) => name !== CACHE_NAME ? caches.delete(name) : null))
    )
  );
  self.clients.claim();
});

// 3. ESTRATEGIA: caché instantánea + refresco en segundo plano
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (isSameOrigin) {
    // Tus archivos: servir de caché al instante y actualizar en silencio
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cachedResponse) => {
          const networkFetch = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse || caches.match('./index.html'));
          return cachedResponse || networkFetch;
        })
      )
    );
  }
  // Lo externo (API del QR, y luego Supabase) no se intercepta:
  // si no hay internet, simplemente falla con elegancia.
});
