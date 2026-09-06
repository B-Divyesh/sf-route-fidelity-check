const CACHE_PREFIX = 'route-fidelity-check-';
const CACHE = `${CACHE_PREFIX}v4`;
const SHELL = [
  '/demo',
  '/assets/route-landscape.webp',
  '/assets/sf-route-fidelity-check-social.webp',
  '/favicon.svg',
  '/icons/apple-touch-icon.png',
  '/icons/sf-route-fidelity-check-icon-192.png',
  '/icons/sf-route-fidelity-check-icon-512.png',
  '/icons/sf-route-fidelity-check-maskable-512.png',
  '/legal.css',
  '/manifest.webmanifest',
  '/offline.html',
  '/404.html',
  '/privacy/',
  '/terms/',
];

async function precacheShell() {
  const cache = await caches.open(CACHE);
  const page = await fetch('/', { cache: 'reload' });
  await cache.put('/', page.clone());
  const html = await page.text();
  const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map((match) => match[1]);
  await cache.addAll([...new Set([...SHELL, ...builtAssets])]);
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const hadPreviousVersion = keys.some((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE);
    await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
    if (hadPreviousVersion) {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach((client) => client.postMessage({ type: 'APP_UPDATE_AVAILABLE' }));
    }
  })());
});

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await caches.match(request, { ignoreSearch: true }))
      || (await caches.match('/offline.html'))
      || Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(event.request.mode === 'navigate'
    ? networkFirstNavigation(event.request)
    : cacheFirst(event.request));
});
