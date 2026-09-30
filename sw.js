const CACHE = 'taxi-book-' + Date.now();

self.addEventListener('install', e => {
  self.skipWaiting();  // 新版立即接管
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())  // 立即控制所有頁面
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // 網路優先，失敗才用快取 → 保證拿到最新版
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
