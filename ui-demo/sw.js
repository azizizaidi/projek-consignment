// Versioned app shell. Fetch fresh files when online; use cached demo offline.
const CACHE = "sas-empire-az1";
const SHELL = [
  "./",
  "./index.html",
  "./login.html",
  "./staf-dashboard.html",
  "./staf-senarai.html",
  "./staf-kedai.html",
  "./staf-laporan.html",
  "./staf-profil.html",
  "./superadmin.html",
  "./assets/style.css?v=az1",
  "./assets/app.js?v=az1",
  "./assets/data.js",
  "./manifest.json",
  "./assets/brand.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
];
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("sas-empire-") && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (e) => {
  if (
    e.request.method !== "GET" ||
    new URL(e.request.url).origin !== self.location.origin
  )
    return;
  e.respondWith(
    fetch(e.request)
      .then(async (res) => {
        if (res.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(e.request, res.clone());
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(e.request);
        if (cached) return cached;
        if (e.request.mode === "navigate") {
          const u = new URL(e.request.url);
          u.search = "";
          const page = await caches.match(u.href);
          if (page) return page;
        }
        return new Response(
          "Halaman belum dicache. Sambung internet dan cuba lagi.",
          {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          },
        );
      }),
  );
});
