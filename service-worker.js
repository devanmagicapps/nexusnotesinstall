// Nama cache unik. Ubah nomor versi jika Anda memperbarui file cache.
const CACHE_NAME = 'nexus-notes-cache-v1';

// Daftar file yang akan di-cache saat instalasi service worker.
const urlsToCache = [
  '/', // Mewakili index.html
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

// Event 'install': Dipicu saat service worker diinstal.
self.addEventListener('install', event => {
  console.log('Service Worker: Menginstal...');
  // Menunda event install sampai cache selesai dibuat.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Membuka cache dan menambahkan aset inti.');
        // Menambahkan semua URL dari daftar ke cache.
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Semua aset berhasil di-cache. Instalasi selesai.');
        // Melewati fase 'waiting' dan langsung mengaktifkan service worker baru.
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Gagal melakukan caching saat instalasi:', error);
      })
  );
});

// Event 'activate': Dipicu saat service worker diaktifkan.
self.addEventListener('activate', event => {
  console.log('Service Worker: Mengaktifkan...');
  // Menunda event activate sampai cache lama selesai dihapus.
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Jika nama cache tidak sama dengan yang sedang digunakan, hapus.
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Cache lama berhasil dibersihkan. Aktivasi selesai.');
      // Mengambil kontrol atas halaman yang tidak terkontrol.
      return self.clients.claim();
    })
  );
});

// Event 'fetch': Dipicu setiap kali ada permintaan jaringan dari halaman.
self.addEventListener('fetch', event => {
  // Hanya menangani permintaan GET.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Menggunakan strategi "cache-first".
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika respons ditemukan di cache, kembalikan dari cache.
        if (response) {
          // console.log('Service Worker: Mengambil dari cache:', event.request.url);
          return response;
        }

        // Jika tidak ada di cache, coba ambil dari jaringan.
        // console.log('Service Worker: Mengambil dari jaringan:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Periksa apakah respons valid.
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Klon respons karena akan digunakan dua kali (oleh cache dan browser).
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Simpan respons baru ke dalam cache untuk penggunaan berikutnya.
                // console.log('Service Worker: Menyimpan ke cache:', event.request.url);
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(error => {
            // Tangani error jika gagal mengambil dari jaringan (misalnya, saat offline).
            console.error('Service Worker: Gagal mengambil dari jaringan:', error);
            // Anda bisa mengembalikan halaman fallback offline di sini jika diperlukan.
          });
      })
  );
});
