const cacheName = "pizza-jasterka-pwa-v10";
const assets = [
  "./",
  "./index.html",
  "./admin.html",
  "./kitchen.html",
  "./courier.html",
  "./partner-courier.html",
  "./styles.css",
  "./staff.css",
  "./partner-courier.css",
  "./app.js",
  "./admin.js",
  "./kitchen.js",
  "./courier.js",
  "./partner-courier.js",
  "./manifest.webmanifest",
  "./partner-courier.webmanifest",
  "./assets/icon.svg",
  "./assets/hero-pizza.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(assets)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          if (event.request.mode === "navigate") return caches.match("./index.html");
          return cached;
        })
      );
    })
  );
});

self.addEventListener("push", (event) => {
  const payload = event.data?.json?.() || { title: "Pizza Jasterka", body: "Stav objednávky bol aktualizovaný." };
  event.waitUntil(
    self.registration.showNotification(payload.title || "Pizza Jasterka", {
      body: payload.body || "Stav objednávky bol aktualizovaný.",
      icon: "./assets/icon.svg",
      badge: "./assets/icon.svg",
      data: payload.data || {}
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("./"));
});