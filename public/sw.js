const CACHE_NAME = 'krug-archive-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Install — кешируем основные ресурсы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — удаляем старые кеши
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — сначала сеть, при ошибке — кеш (network-first)
self.addEventListener('fetch', (event) => {
  // Не кешируем аудиофайлы и внешние ресурсы
  const url = new URL(event.request.url);
  if (
    url.hostname !== self.location.hostname ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Кешируем успешные ответы
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Офлайн — берём из кеша
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Для навигации — отдаём главную страницу
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
