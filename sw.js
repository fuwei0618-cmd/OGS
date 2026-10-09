// 版本號：每次更新內容就改這裡，手機才會抓到新版
const CACHE = 'ogs-v7';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// 有網路時先抓最新版，沒網路時用離線存檔
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (/graph\.microsoft\.com|login\.microsoftonline\.com|1drv|sharepoint/.test(new URL(e.request.url).host)) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
