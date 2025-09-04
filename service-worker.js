
const CACHE = 'kf-cache-v1';
const ASSETS = [
  '/',
  '/index.html','/catalog.html','/new.html','/trending.html','/top.html','/movie.html','/favorites.html','/auth.html','/profile.html',
  '/assets/css/app.css',
  '/assets/js/app.js','/assets/js/movie.js','/assets/js/auth.js','/assets/js/profile.js',
    '/assets/img/icon-192.png','/assets/img/icon-512.png'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e=>{
  if (e.request.method!=='GET') return;
  e.respondWith((async ()=>{
    const cached = await caches.match(e.request);
    try{
      const fresh = await fetch(e.request);
      const cache = await caches.open(CACHE);
      cache.put(e.request, fresh.clone());
      return fresh;
    }catch(_){
      return cached || caches.match('/index.html');
    }
  })());
});
