/* Passport Photo Studio service worker. Bump VERSION whenever you upload a new index.html. */
const VERSION='v5';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
const CACHE='pps-'+VERSION,RUNTIME='pps-runtime';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('pps-')&&k!==CACHE&&k!==RUNTIME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    // the app itself: try the network first so updates arrive, fall back to the saved copy when offline
    e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
    return;
  }
  // AI cut-out files (CDN): save on first use so the AI also works offline afterwards
  if(/jsdelivr\.net|storage\.googleapis\.com/.test(u.host)){
    e.respondWith(caches.open(RUNTIME).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res;}))));
  }
});
