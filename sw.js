// 版本號：每次更新內容就改這裡，手機才會抓到新版
const CACHE = 'ogs-v27';
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
    // 同一個網站的檔案每次都跟伺服器確認有沒有新版，不用瀏覽器暫存的舊檔
    fetch(e.request, new URL(e.request.url).origin === location.origin ? {cache: 'no-cache'} : undefined).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request).then(r => r || (new URL(e.request.url).pathname.includes('/briefing/') ? caches.match('briefing/') : caches.match('index.html'))))
  );
});
