// Offline support for the groundnut kernel price calculator.
// When you upload a new version of any file, change VERSION (e.g. to v2)
// so phones download the new files the next time they open the app online.
const VERSION = "kernel-price-v4";

const FILES = [
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];

// Save every file on the device. cache: "reload" skips the browser's
// HTTP cache so an update always stores the files currently on the server.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(FILES.map((f) => new Request(f, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

// Remove copies saved by older versions.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("kernel-price-") && key !== VERSION)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Serve from the device first; go to the network only for anything not saved.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then((saved) => saved || fetch(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((saved) => saved || fetch(request))
  );
});
