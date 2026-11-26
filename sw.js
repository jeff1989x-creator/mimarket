// Pedidos MiMarket valida el catálogo al abrir y guarda una copia para cuando se pierde la conexión.
const CACHE = 'mimarket-202611260906';
const BASE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './destacados.css', './destacados.js', './img/catalogo/fotos.json'];

self.addEventListener('install', event => {
  const files = BASE.map(file => new Request(new URL(file, self.registration.scope), { cache: 'reload' }));
  event.waitUntil(caches.open(CACHE)
    .then(cache => cache.addAll(files))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys
      .filter(key => key.startsWith('mimarket-') && key !== CACHE)
      .map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin || new URL(request.url).searchParams.has('v')) return;

  const navigation = request.mode === 'navigate';
  const revalidate = navigation || ['script', 'style'].includes(request.destination);
  const options = revalidate ? { cache: 'no-cache' } : undefined;
  event.respondWith(fetch(request, options).then(response => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {}));
    }
    return response;
  }).catch(async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached || !navigation) return cached || Response.error();
    return (await cache.match('./')) || (await cache.match('./index.html')) || Response.error();
  }));
});
