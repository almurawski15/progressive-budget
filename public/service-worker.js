const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/db.js',
  '/index.js',
  '/style.css',
  '/manifest.json',

];

const CACHE_NAME = 'static-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v2';

//install event listener
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log("Your files have been pre-cached!");
        return cache.addAll(FILES_TO_CACHE);
      })
  );

  self.skipWaiting();
});

// Activate handler to take care of cleaning up old caches 
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(clears => {
            if (clears !== CACHE_NAME && clears !== DATA_CACHE_NAME) {
              console.log("Old data removed", clears);
              return caches.delete(clears);
            }
          })
        );
      })
  );

  self.clients.claim();
});

//fetch listener 
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          })
          .catch (err => {

            return cache.match(event.request);
          });

          }).catch(err => {
            console.log(err)
          })
      );

      return;

        }

        event.respondWith(
          caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
              return response || fetch(event.request);
            });
          })
        );

  });

