// SAS EMPIRE — service worker (PWA)
const CACHE = "sas-empire-v1";
const SHELL = [
  "./", "./login.html", "./index.html",
  "./staf-senarai.html", "./staf-kedai.html", "./staf-laporan.html", "./staf-profil.html",
  "./superadmin.html",
  "./assets/style.css", "./assets/data.js", "./assets/ui.js",
  "./assets/icon-192.png", "./assets/icon-512.png",
  "./manifest.json",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
    )
  );
});
