import { genericOAuthClient } from "better-auth/client/plugins";
import { randomId } from "@/lib/random-id";
import { createAuthClient } from "better-auth/react";
import {
  runPreSignInSignOut,
  runSignOut,
  verifyPreviewSession,
} from "../../../scripts/sign-out-plan.mjs";
import { GROK_PROVIDERS } from "./providers";

/**
 * Better Auth client for this React SPA (browser-side).
 *
 * Talks to this app's OWN Better Auth at same-origin `/api/auth/*`. In the live
 * preview the app is an embedded iframe with PARTITIONED cookies, so after a
 * popup sign-in it can't read the session cookie — it authenticates with a
 * bearer token instead (captured from the popup, see `signIn`). The `onRequest`
 * hook attaches that token when present; when deployed (cookie auth) no token
 * is stored, so nothing changes.
 *
 * To sign out call `signOut()` below, NOT `authClient.signOut()`: the raw call
 * leaves the bearer token in place, and `onRequest` keeps re-attaching it, so
 * the visitor stays signed in.
 */
export const authClient = createAuthClient({
  plugins: [genericOAuthClient()],
  fetchOptions: {
    onRequest(ctx) {
      const token = getBearerToken();
      if (token) ctx.headers.set("Authorization", `Bearer ${token}`);
      return ctx;
    },
  },
});

/**
 * True when sign-in UI should be shown — i.e. whenever `VITE_AUTH_ENABLED` is
 * not `"false"`. The shipped template sets it to `"false"`
 * (`.grok/app-env.json`), which selects the dev user (see `use-current-user`);
 * with the key removed, sign-in is real in preview (baked preview client) and
 * when deployed (injected per-app client).
 */
export const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== "false";

/** The upstream providers to render sign-in buttons for. */
export { GROK_PROVIDERS };

// ── Live-preview bearer token ────────────────────────────────────────────────
// The embedded preview iframe has partitioned cookies, so we keep the session's
// bearer token in sessionStorage and attach it to every Better Auth request (and
// to server functions, via `@/lib/auth/middleware`). Empty everywhere except the
// preview after a popup sign-in, so the cookie path is untouched elsewhere.
const BEARER_KEY = "grok-auth.bearer-token";

/** The stored preview bearer token, or null. */
export function getBearerToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(BEARER_KEY);
  } catch {
    return null;
  }
}

function setBearerToken(token: string | null): void {
  if (typeof window === "undefined") {
    throw new Error("Preview session storage is unavailable");
  }
  try {
    if (token) window.sessionStorage.setItem(BEARER_KEY, token);
    else window.sessionStorage.removeItem(BEARER_KEY);
    const stored = window.sessionStorage.getItem(BEARER_KEY);
    if ((token && stored !== token) || (!token && stored !== null)) {
      throw new Error("Preview session storage did not confirm the change");
    }
  } catch (cause) {
    throw new Error("Preview session storage could not be updated", { cause });
  }
}

/**
 * The sandbox live preview runs this app inside an iframe on a `*.grok-sandbox.com`
 * host, where a full-page redirect to the broker can't work — so sign-in uses a
 * popup there and a normal redirect everywhere else.
 */
function inLivePreview(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.hostname.endsWith(".grok-sandbox.com")
  );
}

function sameOriginCallbackPath(value: string, label: string): string {
  if (typeof window === "undefined") return value;
  const url = new URL(value, window.location.origin);
  if (url.origin !== window.location.origin) {
    throw new Error(`The ${label} path must stay on this app.`);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Message the popup posts back to the opener once sign-in completes. */
type PopupMessage = {
  source: "grok-auth-popup";
  token: string | null;
  nonce: string;
  error?: string;
};
type PopupAttempt = { popup: Window; nonce: string; oauthUrl: string };

/**
 * Start sign-in with one upstream provider (`providerId` from `GROK_PROVIDERS`),
 * federating through the Grok auth broker.
 *
 * - **Live preview** (`*.grok-sandbox.com` iframe): opens a POPUP to
 *   `/auth/popup`, served by the template Vite plugin (see `vite.config.ts` +
 *   `popup.server.ts`) — 302s to the broker/upstream login (no app chrome) and,
 *   on return, posts the session bearer token back. We store it and refresh the
 *   session; no top-level navigation of the iframe to the broker.
 * - **Deployed** (and local non-iframe): a normal full-page redirect into the broker.
 *
 * Either way it clears any existing local session FIRST so switching providers
 * actually switches identity.
 */
export async function signIn(
  providerId: string,
  opts: { callbackURL?: string; errorCallbackURL?: string } = {},
): Promise<void> {
  if (!GROK_PROVIDERS.some((provider) => provider.providerId === providerId)) {
    throw new Error("Unsupported sign-in provider");
  }
  const callbackURL = sameOriginCallbackPath(
    opts.callbackURL ?? "/",
    "sign-in return",
  );
  const errorCallbackURL = sameOriginCallbackPath(
    opts.errorCallbackURL ?? "/",
    "sign-in error return",
  );

  // Open the popup SYNCHRONOUSLY on the user gesture — before any await
  // (including signOut). Awaiting first drops user-gesture privilege in some
  // browsers when the opener is a cross-origin live-preview iframe.
  const livePreview = inLivePreview();
  const popupAttempt = livePreview ? openSignInPopup(providerId) : null;
  if (livePreview && !popupAttempt) {
    throw new Error("Pop-up blocked — allow pop-ups for sign-in");
  }

  let localEraseStarted = false;
  try {
    // Clear any prior session so switching providers actually switches
    // identity. The live-preview window is already open to preserve the user
    // gesture, but remains on an inert same-origin document until BOTH this
    // sign-out and the local-data erase are confirmed.
    await runPreSignInSignOut({
      livePreview,
      hasBearer: Boolean(getBearerToken()),
      requestSignOut: requestConfirmedSignOut,
      clearToken: () => setBearerToken(null),
    });
    localEraseStarted = true;
    await clearPriorAccountLocalData();

    if (livePreview) {
      if (!popupAttempt) throw new Error("Pop-up blocked — allow pop-ups for sign-in");
      activateSignInPopup(popupAttempt);
      const token = await waitForPopupToken(popupAttempt);
      if (!token) throw new Error("Sign-in was cancelled or failed");
      setBearerToken(token);
      // Refresh and verify the session with the bearer attached (onRequest).
      // A popup token is not considered a completed sign-in until the app's own
      // session endpoint confirms an identified user. Keeping an unverified
      // bearer would let a transient/bad completion message survive in storage
      // and make the next render appear ambiguously signed in.
      await verifyPreviewSession({
        requestSession: () => authClient.getSession(),
        clearToken: () => setBearerToken(null),
      });
      if (typeof window !== "undefined") {
        const dest = new URL(callbackURL, window.location.origin);
        if (dest.origin !== window.location.origin) {
          throw new Error("The sign-in return path must stay on this app.");
        }
        // Always navigate—even to the current route—so no store hydrated before
        // the account switch can survive the confirmed new session.
        window.location.href = `${dest.pathname}${dest.search}${dest.hash}`;
      }
      return;
    }

    const { data, error } = await authClient.signIn.oauth2({
      providerId,
      callbackURL,
      errorCallbackURL,
    });
    if (error) throw new Error(error.message ?? "Sign-in failed");
    if (!data?.url) throw new Error("The identity provider did not return a sign-in URL.");
    window.location.href = data.url;
  } catch (cause) {
    popupAttempt?.popup.close();
    // Persistent records may already be gone while Zustand stores still hold
    // their pre-erase snapshots. If OAuth is cancelled or preparation fails,
    // make one final erase pass immediately before reload so snapshots changed
    // while the popup was open cannot survive in storage either.
    if (localEraseStarted && typeof window !== "undefined") {
      try {
        await clearPriorAccountLocalData();
      } catch {
        // Force the provider to retry/block after reload even when the first
        // preparation pass had already written the signed-out marker.
        try {
          const { writeAccountMarker } = await import("@/lib/privacy/local-data");
          writeAccountMarker(JSON.stringify([1, "erase-unconfirmed"]));
        } catch {
          // Storage denial is independently detected by AuthProvider's marker
          // read; the reload remains necessary to discard in-memory snapshots.
        }
      }
      window.location.reload();
    }
    throw cause;
  }
}

/**
 * Open `/auth/popup` in a new window. Must run synchronously inside the click
 * handler (no await before this). The path is served by the template Vite
 * plugin (`authPopupPlugin` in vite.config.ts) — NOT by a React route.
 *
 * The window intentionally starts on an inert document. `signIn` activates it
 * only after prior-session sign-out and local erase both finish, preventing an
 * OAuth request from racing ahead with stale account state.
 */
function openSignInPopup(providerId: string): PopupAttempt | null {
  const origin = window.location.origin;
  const nonce = randomId().replaceAll("-", "");
  const oauthUrl = `${origin}/auth/popup?providerId=${encodeURIComponent(providerId)}&nonce=${encodeURIComponent(nonce)}`;
  const pendingUrl = `${origin}/auth/popup?pending=1&nonce=${encodeURIComponent(nonce)}`;
  // Unique name per attempt so a prior attempt stuck on the SPA is not reused.
  const name = `grok-signin-${Date.now()}`;
  const popup = window.open(pendingUrl, name, "popup,width=500,height=650");
  if (!popup) return null;
  return { popup, nonce, oauthUrl };
}

function activateSignInPopup({ popup, oauthUrl }: PopupAttempt): void {
  if (popup.closed) throw new Error("The sign-in window was closed");
  popup.location.replace(oauthUrl);
}

/**
 * Wait for the popup's completion page to postMessage the session bearer (or
 * for the user to dismiss the popup).
 */
function waitForPopupToken({ popup, nonce }: PopupAttempt): Promise<string | null> {
  return new Promise((resolve) => {
    const origin = window.location.origin;
    let settled = false;
    let closeTimer: number | undefined;
    const settle = (token: string | null) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(token);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== popup) return;
      if (event.origin !== origin) return;
      const data = event.data as PopupMessage | undefined;
      if (!data || data.source !== "grok-auth-popup" || data.nonce !== nonce) return;
      settle(data.token ?? null);
    };
    // Fallback when the user dismisses the popup. Grace period lets the
    // completion page's postMessage win over a racing `popup.closed`.
    const pollTimer = window.setInterval(() => {
      if (!popup.closed) return;
      window.clearInterval(pollTimer);
      closeTimer = window.setTimeout(() => settle(null), 400);
    }, 300);
    function cleanup() {
      window.clearInterval(pollTimer);
      if (closeTimer !== undefined) window.clearTimeout(closeTimer);
      window.removeEventListener("message", onMessage);
    }
    window.addEventListener("message", onMessage);
  });
}

/**
 * Sign out of THIS app's local session, clear the preview token, then redirect.
 *
 * Use this, never `authClient.signOut()` — see the note on `authClient`.
 * Sequencing lives in `scripts/sign-out-plan.mjs` so it can be unit-tested.
 *
 * **Rejects when deployed if the server never confirms.** There the session is
 * an HttpOnly cookie only the server can clear, so redirecting anyway would
 * report a sign-out that did not happen. `<UserButton />` handles that for you;
 * a hand-rolled control must catch it and let the visitor retry. In the live
 * preview the local clear is sufficient, so it always resolves.
 */
export async function signOut(redirectTo = "/"): Promise<void> {
  await runSignOut({
    livePreview: inLivePreview(),
    hasBearer: Boolean(getBearerToken()),
    // Better Auth resolves with `{ error }` instead of rejecting, so surface a
    // failed response as a rejection for the sequence to act on.
    requestSignOut: requestConfirmedSignOut,
    clearToken: () => setBearerToken(null),
    redirect: () => undefined,
  });
  try {
    await clearPriorAccountLocalData();
  } catch (cause) {
    // The server session has already ended. Reload into the account gate so a
    // partially cleared origin cannot keep hydrated data alive in this tab.
    window.location.reload();
    throw cause;
  }
  window.location.href = redirectTo;
}

/**
 * Erase this account's browser-local Knotty content without claiming to end
 * the session. Hosting-gate deployments immediately restore their asserted
 * identity after an app-cookie sign-out, so their UI uses this operation and
 * directs the visitor to host controls when account access must end.
 */
export async function clearLocalAccountData(): Promise<void> {
  const { eraseAllLocalData } = await import("@/lib/privacy/local-data");
  const result = await eraseAllLocalData({ broadcastToCurrentContext: false });
  if (
    !result.browserStorageCleared ||
    !result.voiceCacheCleared ||
    result.legacyStills !== "deleted_or_absent"
  ) {
    throw new Error(
      "Local content could not be confirmed cleared. Close other Knotty tabs and try again.",
    );
  }
  window.location.reload();
}

async function requestConfirmedSignOut(): Promise<void> {
  const { error } = await authClient.signOut();
  if (error) throw new Error(error.message ?? "Sign-out failed");
}

async function clearPriorAccountLocalData(): Promise<void> {
  const { accountMarkerFor, eraseAllLocalData, writeAccountMarker } = await import(
    "@/lib/privacy/local-data"
  );
  const result = await eraseAllLocalData({ broadcastToCurrentContext: false });
  if (
    !result.browserStorageCleared ||
    !result.voiceCacheCleared ||
    result.legacyStills !== "deleted_or_absent"
  ) {
    throw new Error(
      "The account session changed, but sensitive local data could not be confirmed cleared. Do not sign in as another person in this browser profile.",
    );
  }
  // The confirmed-empty origin is signed-out at this point. Persist this before
  // OAuth (or the final hard navigation) so the automatic account gate cannot
  // race the button handler and clear/reload a second time.
  writeAccountMarker(accountMarkerFor(null));
}
