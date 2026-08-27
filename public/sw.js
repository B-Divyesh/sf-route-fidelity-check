const CACHE = 'route-fidelity-check-v3';
const SHELL = ['/assets/route-landscape.webp', '/favicon.svg', '/legal.css', '/privacy/', '/terms/'];

async function precacheShell() {
  const cache = await caches.open(CACHE);
  const page = await fetch('/', { cache: 'reload' });
  await cache.put('/', page.clone());
  const html = await page.text();
  const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
  await cache.addAll([...new Set([...SHELL, ...builtAssets])]);
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  }).catch(async () => event.request.mode === 'navigate' ? (await caches.match('/')) ?? Response.error() : Response.error())));
});
