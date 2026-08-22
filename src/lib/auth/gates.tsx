import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import {
  getAuthCapabilitiesBounded,
  type AuthCapabilities,
} from "./capabilities";
import { authEnabled, clearLocalAccountData, signOut } from "./client";
import { useCurrentUser, useCurrentUserState } from "./use-current-user";

let capabilityRequest: Promise<AuthCapabilities> | null = null;

function loadAuthCapabilities(): Promise<AuthCapabilities> {
  if (!capabilityRequest) {
    capabilityRequest = getAuthCapabilitiesBounded().catch((cause) => {
      capabilityRequest = null;
      throw cause;
    });
  }
  return capabilityRequest;
}

/**
 * Auth state components — plain wrappers around `useCurrentUserState()`.
 *
 * With auth on, visitors are signed out until they authenticate — in the sandbox
 * live preview too, which does real sign-in. The shared dev user appears only
 * when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
 * While the session is still resolving, gates that care about signed-out state
 * render nothing so there's no signed-out flash on hard reload.
 */

/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
export const SIGN_IN_PATH = "/login";

/** Render children only when a user is present (real session, or the disabled-auth dev user). */
export function SignedIn({ children }: { children: ReactNode }) {
  const { user } = useCurrentUserState();
  return user ? <>{children}</> : null;
}

/**
 * Render children only once we KNOW the visitor is signed out (`isPending` has
 * cleared and there is no user). Hidden while the session is still loading.
 */
export function SignedOut({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending || user) return null;
  return <>{children}</>;
}

/**
 * Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
 * `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
 * session loading, which feels like a second "Loading…" on /login.
 *
 * Guard routes by waiting out `isPending` first (see `use-current-user`), then
 * render this.
 */
export function RedirectToSignIn({ to = SIGN_IN_PATH }: { to?: string }) {
  return <Navigate to={to} />;
}

/**
 * Minimal signed-in identity chip plus a capability-aware account action.
 * Hosting-gate sessions expose local clearing with honest host-exit copy;
 * ordinary OAuth sessions expose app sign-out. The disabled-auth dev user has
 * neither action.
 */
export function UserButton({ compact = false }: { compact?: boolean }) {
  const user = useCurrentUser();
  // Sign-out can take a moment (and can fail when deployed), so the control
  // shows it is working and cannot be fired twice.
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  // "Clear local data" erases settings, negotiated limits, plans and journal
  // entries that cannot be regenerated, so it takes a deliberate second press.
  const [confirmClear, setConfirmClear] = useState(false);
  const [capabilities, setCapabilities] = useState<AuthCapabilities | null>(null);
  const [capabilityFailed, setCapabilityFailed] = useState(false);
  useEffect(() => {
    if (!authEnabled) return;
    let current = true;
    void loadAuthCapabilities().then(
      (value) => {
        if (current) setCapabilities(value);
      },
      () => {
        if (current) setCapabilityFailed(true);
      },
    );
    return () => {
      current = false;
    };
  }, []);
  if (!user) return null;
  const label = user.displayName ?? user.primaryEmail ?? "Account";
  const gateManaged = capabilities?.gateIdentity === true;
  const capabilitiesPending = capabilities === null && !capabilityFailed;
  const localClearOnly = gateManaged || capabilityFailed || capabilitiesPending;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        aria-hidden="true"
        className="grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20"
      >
        {label.charAt(0).toUpperCase()}
      </span>
      <span className={compact ? "sr-only" : "text-sm font-medium"}>{label}</span>
      {authEnabled && (
        <button
          type="button"
          disabled={signingOut}
          onClick={() => {
            setSignOutError(null);
            if (localClearOnly && !confirmClear) {
              setConfirmClear(true);
              return;
            }
            setSigningOut(true);
            const action = localClearOnly
              ? clearLocalAccountData()
              : signOut();
            // Success reloads/navigates; on failure re-enable so it can be retried.
            void action.catch((cause) => {
              setSigningOut(false);
              setSignOutError(
                cause instanceof Error
                  ? cause.message
                  : localClearOnly
                    ? "Local content could not be cleared; please try again."
                    : "Sign-out failed. You may still be signed in; please try again.",
              );
            });
          }}
          className="cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline"
        >
          {signingOut
            ? localClearOnly
                ? "Clearing…"
                : "Signing out…"
            : localClearOnly
              ? confirmClear
                ? "Confirm: erase local data"
                : "Clear local data"
              : "Sign out"}
        </button>
      )}
      {localClearOnly && confirmClear && !signingOut && (
        <button
          type="button"
          onClick={() => setConfirmClear(false)}
          className="cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline"
        >
          Cancel
        </button>
      )}
      {localClearOnly && (
        <p className={compact ? "sr-only" : "basis-full text-xs leading-relaxed text-subtle"}>
          {gateManaged
            ? "The hosting gate controls account access. Exit or sign out through the host to end access; this control only clears Knotty data from this browser."
            : capabilityFailed
              ? "Knotty could not verify who controls this session. Only local data clearing is available."
              : "Knotty is checking who controls this session. Local data clearing remains available and does not claim to end account access."}
        </p>
      )}
      {signOutError && (
        <p className="max-w-xs text-xs leading-relaxed text-danger-text" role="alert">
          {signOutError}
        </p>
      )}
    </div>
  );
}
