// Network-first: always try fresh news, fall back to the last saved copy when offline.
const C = "bharat-news-v1";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(["./", "./index.html", "./manifest.webmanifest", "./icon-192.png"])));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  const key = u.pathname.endsWith("/news.json") ? new Request(u.origin + u.pathname) : e.request;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(key, cp)); }
      return r;
    }).catch(() => caches.match(key).then(m => m || caches.match("./index.html")))
  );
});
