// Nama cache unik. Ubah nomor versi jika Anda memperbarui file cache.
const CACHE_NAME = 'nexus-notes-cache-v2';

// Daftar file yang akan di-cache saat instalasi service worker.
const urlsToCache = [
  '/', // index.html
  'index.html',
  'manifest.json',
  './icons/image192.png',
  './icons/image512.png',
  'https://cdn.tailwindcss.com',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js',
  'https://img.icons8.com/ios-glyphs/30/plus-math.png',
  'https://img.icons8.com/material-outlined/30/save.png',
  'https://img.icons8.com/ios-glyphs/30/trash.png',
  'https://img.icons8.com/ios-glyphs/30/left.png',
  'https://img.icons8.com/ios-glyphs/30/loading-circle.png',
  'https://img.icons8.com/ios-glyphs/30/lock.png',
  'https://img.icons8.com/ios-glyphs/30/unlock.png',
  'https://img.icons8.com/ios-glyphs/30/settings.png',
  'https://img.icons8.com/ios-glyphs/30/flash-on.png',
  'https://img.icons8.com/ios-glyphs/30/edit.png',
  'https://img.icons8.com/ios-glyphs/30/hashtag.png',
  'https://img.icons8.com/ios-glyphs/30/checked-2.png'
];

// Install event
self.addEventListener('install', event => {
  console.log('Service Worker: Install...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Pre-caching...');
      return cache.addAll(urlsToCache);
    }).then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('Service Worker: Activate...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Service Worker: Hapus cache lama:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: ONLINE-FIRST
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Kalau response valid, simpan ke cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Kalau gagal ambil dari network → coba ambil dari cache
        return caches.match(event.request);
      })
  );
});