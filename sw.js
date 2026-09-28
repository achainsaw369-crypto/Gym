const CACHE='zhurnal-v3';
const FILES=['./','index.html','manifest.json','icon-180.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const store=r=>{if(r&&r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(req,c))}return r};
  if(req.mode==='navigate'){
    // сначала сеть (до 2,5 с), без сети или при медленной связи открывается сохранённая копия
    const net=fetch(req.url,{cache:'no-store'}).then(store);
    e.respondWith(Promise.race([net,new Promise((_,rej)=>setTimeout(rej,2500))])
      .catch(()=>caches.match(req).then(h=>h||caches.match('./')).then(h=>h||net)));
    return;
  }
  e.respondWith(caches.match(req).then(hit=>{
    const net=fetch(req,{cache:'no-store'}).then(store).catch(()=>hit);
    return hit||net;
  }));
});
