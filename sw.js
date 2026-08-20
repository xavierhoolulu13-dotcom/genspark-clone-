/* GenSpark (clone) service worker — offline-first app shell + smart runtime caching */
"use strict";

const VERSION = "v1.1.0";
const APP_CACHE = "genspark-shell-" + VERSION;
const RUNTIME_CACHE = "genspark-runtime-" + VERSION;

const APP_SHELL = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "assets/css/styles.css",
  "assets/js/kb.js",
  "assets/js/backend.js",
  "assets/js/engine.js",
  "assets/js/app.js",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-180.png",
];

/* Precache the shell on install */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

/* Clean up old caches */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith("genspark-") && !k.includes(VERSION)).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", e => {
  if (e.data === "ping") e.source?.postMessage?.("pong");
});

/* Fetch strategy:
   - navigations      → network first, fall back to cached index.html (SPA works offline)
   - same-origin      → cache first, cache new copies in background
   - wikipedia APIs   → network first (fresh when possible), fall back to cache
   - wiki images      → stale-while-revalidate
   - everything else  → network with cache fallback
*/
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // SPA navigations
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => { put(RUNTIME_CACHE, req, res.clone()); return res; })
        .catch(() => caches.match("index.html"))
    );
    return;
  }

  // same-origin static assets: cache-first
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok) put(APP_CACHE, req, res.clone());
        return res;
      }))
    );
    return;
  }

  // Wikipedia APIs: network-first, cache fallback
  if (/wikipedia\.org|wikimedia\.org/.test(url.hostname) && /api|rest_v1/.test(url.pathname)) {
    event.respondWith(
      fetch(req)
        .then(res => { if (res.ok) put(RUNTIME_CACHE, req, res.clone()); return res; })
        .catch(() => caches.match(req).then(hit => hit || res480()))
    );
    return;
  }

  // Wikimedia images: stale-while-revalidate
  if (/upload\.wikimedia\.org/.test(url.hostname)) {
    event.respondWith(
      caches.match(req).then(hit => {
        const refresh = fetch(req).then(res => { if (res.ok || res.type === "opaque") put(RUNTIME_CACHE, req, res.clone()); return res; });
        return hit || refresh;
      })
    );
    return;
  }

  // default: network with cache fallback
  event.respondWith(
    fetch(req)
      .then(res => { if (res.ok) put(RUNTIME_CACHE, req, res.clone()); return res; })
      .catch(() => caches.match(req))
  );
});

function put(cacheName, req, res) {
  caches.open(cacheName).then(c => c.put(req, res)).catch(() => { /* opaque/quota issues are fine to skip */ });
}
function res480() {
  return new Response(JSON.stringify({ error: "offline" }), { status: 480, headers: { "Content-Type": "application/json" } });
}
