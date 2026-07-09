const CACHE_NAME = 'kanban-tarefas-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
];

// Instalação: Cacheia os arquivos estáticos básicos
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ativação: Remove caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
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

// Fetch: Estratégia de Cache-First para recursos estáticos e Network-First para páginas/APIs
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Apenas intercepta requisições HTTP/HTTPS (ignora chrome-extension, etc.)
  if (!url.protocol.startsWith('http')) return;

  // Ignora requisições de API (Prisma/DB) e rota de live reload do Next.js
  if (url.pathname.startsWith('/api') || url.pathname.includes('/_next/webpack-hmr')) {
    return;
  }

  // Para imagens, ícones e fontes: Cache-First
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cacheCopy);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Fallback silencioso se a rede falhar e não estiver no cache
        });
      })
    );
    return;
  }

  // Para outras requisições (ex: páginas HTML): Network-First com Fallback para Cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Se a requisição foi bem sucedida, atualiza o cache para a página
        if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cacheCopy);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Se a rede falhar, tenta buscar do cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          
          // Se não tiver no cache e for uma navegação de página, retorna a home
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
