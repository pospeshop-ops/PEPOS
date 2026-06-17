const CACHE_NAME = 'pe-bookshop-pos-v2';

// Cache critical app shell elements first
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CRITICAL_ASSETS).catch((err) => {
        console.warn('Pre-caching warning during install:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Only intercept GET requests
  if (e.request.method !== 'GET') return;
  
  // Ignore requests from browser extensions or non-HTTP protocols
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then((networkRes) => {
        // If query/fetched file exists and is successful, dynamically cache it
        if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
          const clonedRes = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, clonedRes);
          });
        }
        return networkRes;
      })
      .catch(() => {
        // Fallback to cache if network is down/offline
        return caches.match(e.request).then((cachedRes) => {
          if (cachedRes) {
            return cachedRes;
          }
          // For navigation/page loading fallback to container root/index
          if (e.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
