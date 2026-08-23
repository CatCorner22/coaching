/**
 * The emergency-card service worker. It does one thing.
 *
 * When a navigation to /emergency cannot reach the network, it serves the
 * self-contained copy precached at install. That is the whole scope, on
 * purpose:
 *
 *  - It never caches app HTML, JS, CSS, or images. A service worker that
 *    caches the bundle can serve a stale build for days after a deploy, and a
 *    stale build of *this* app is a worse outcome than a slow one.
 *  - It never calls respondWith() for any other request, so every other fetch —
 *    including dev-server HMR, the API, and xAI calls — behaves exactly as if
 *    no worker were installed.
 *  - It is network-first even for /emergency: the live card wins whenever it
 *    can be fetched, and the cached copy is strictly a fallback.
 *
 * Bump CACHE when public/emergency-offline.html changes so the old entry is
 * dropped rather than shadowing the new one.
 */
const CACHE = "knotty-emergency-v1";
const OFFLINE_CARD = "/emergency-offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE);
        // cache: "reload" so an install never adopts an HTTP-cached copy of the
        // card that is older than the one just deployed.
        await cache.add(new Request(OFFLINE_CARD, { cache: "reload" }));
      } catch {
        // A failed precache must not fail the install: the worker still has to
        // activate so a later install can succeed. The fallback is simply
        // unavailable until then, which is what happens with no worker at all.
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name.startsWith("knotty-") && name !== CACHE).map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.mode !== "navigate") return;

  let path;
  try {
    const url = new URL(request.url);
    // Same-origin only. A cross-origin navigation is none of this worker's
    // business, and answering one would be a redirect nobody asked for.
    if (url.origin !== self.location.origin) return;
    path = url.pathname;
  } catch {
    return;
  }
  if (path !== "/emergency" && path !== OFFLINE_CARD) return;

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(request);
        // A 5xx from a running-but-broken server is still a failure to deliver
        // the card, so fall through to the cached copy rather than render it.
        if (fresh && (fresh.ok || fresh.status < 500)) return fresh;
      } catch {
        // Offline, DNS failure, or the dev server went away.
      }
      const cached = await caches.match(OFFLINE_CARD, { cacheName: CACHE });
      if (cached) return cached;
      return new Response(
        "Emergency card unavailable offline. Call your local emergency-services number now.",
        { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } },
      );
    })(),
  );
});
