/**
 * Registration for the emergency-card service worker (`public/sw.js`).
 *
 * The worker exists so `/emergency` still renders with no network. Registration
 * is best-effort in every direction: no service-worker support, an insecure
 * context, a sandboxed iframe, or a user agent with storage disabled all end in
 * a quiet `false` rather than an exception, because failing to install an
 * offline fallback must never break the online app.
 */

export const EMERGENCY_WORKER_URL = "/sw.js";

export type WorkerHost = {
  serviceWorker?: { register: (url: string, options?: { scope?: string }) => Promise<unknown> };
};

/**
 * Whether this context can host the worker at all.
 *
 * `isSecureContext` covers the case that actually bites during development: the
 * app served over plain HTTP to a phone on the LAN, where registration throws
 * rather than resolving. localhost is a secure context, so `npm run dev` on the
 * machine itself is fine.
 */
export function canRegisterEmergencyWorker(
  nav: WorkerHost | undefined = globalThis.navigator as WorkerHost | undefined,
  secure: boolean | undefined = globalThis.isSecureContext,
): boolean {
  if (typeof nav?.serviceWorker?.register !== "function") return false;
  // `undefined` means a runtime that does not report it at all (jsdom, node);
  // only an explicit `false` is a refusal.
  return secure !== false;
}

/** Register the worker, reporting whether it took rather than throwing. */
export async function registerEmergencyWorker(
  nav: WorkerHost | undefined = globalThis.navigator as WorkerHost | undefined,
  secure: boolean | undefined = globalThis.isSecureContext,
): Promise<boolean> {
  if (!canRegisterEmergencyWorker(nav, secure)) return false;
  try {
    await nav!.serviceWorker!.register(EMERGENCY_WORKER_URL, { scope: "/" });
    return true;
  } catch {
    // A sandboxed frame, a blocked-storage profile, or a 404 on the worker
    // file. The app is unaffected; only the offline fallback is missing.
    return false;
  }
}
