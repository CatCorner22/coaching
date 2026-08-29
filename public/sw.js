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
 * The cached card converges on the deployed one without version bumps: every
 * successful /emergency visit re-fetches and overwrites the cached copy, and
 * activate refills a cache that a failed install left empty. Bumping CACHE
 * remains the way to force-drop an entry immediately.
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
      // A failed install-time precache used to be permanent: the worker
      // activated with an empty cache and nothing ever refilled it, so the
      // fallback stayed dead until the next deploy. Re-attempt here (and on
      // every /emergency fetch below) so one flaky moment at install time
      // cannot cost the card forever.
      await refillPrecacheIfMissing();
      await self.clients.claim();
    })(),
  );
});

async function refillPrecacheIfMissing() {
  try {
    const cache = await caches.open(CACHE);
    const existing = await cache.match(OFFLINE_CARD);
    if (existing) return;
    await cache.add(new Request(OFFLINE_CARD, { cache: "reload" }));
  } catch {
    // Still offline or the server is down; the next attempt may succeed.
  }
}

/** Re-fetch the card and overwrite the cached copy, keeping it current. */
async function refreshPrecache() {
  try {
    const fresh = await fetch(new Request(OFFLINE_CARD, { cache: "reload" }));
    if (!fresh || !fresh.ok) return;
    const cache = await caches.open(CACHE);
    await cache.put(OFFLINE_CARD, fresh);
  } catch {
    // The existing cached copy stays; a later healthy visit converges it.
  }
}

/**
 * Network attempt with a deadline. A blackholed connection (associated wifi
 * that routes nowhere — the classic captive-portal state) can hold a
 * navigation fetch open for tens of seconds before the browser gives up;
 * the person standing at /emergency sees a blank page that whole time while
 * the cached card sits ready. Three seconds is generous for a healthy
 * network and the live card still wins whenever one answers.
 */
function fetchWithDeadline(request, ms) {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return fetch(request, { signal: AbortSignal.timeout(ms) });
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("network deadline")), ms);
    fetch(request).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

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
        const fresh = await fetchWithDeadline(request, 3000);
        // A 5xx from a running-but-broken server is still a failure to deliver
        // the card, so fall through to the cached copy rather than render it.
        if (fresh && (fresh.ok || fresh.status < 500)) {
          // A healthy network moment is also the moment to converge the
          // cached card on the deployed one: installed clients whose worker
          // bytes never changed would otherwise keep a stale card until the
          // CACHE constant is remembered and bumped.
          event.waitUntil(refreshPrecache());
          return fresh;
        }
      } catch {
        // Offline, DNS failure, a stalled network, or the dev server went away.
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
