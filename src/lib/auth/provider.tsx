import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
import {
  accountMarkerFor,
  eraseAllLocalData,
  readAccountMarker,
  writeAccountMarker,
} from "@/lib/privacy/local-data";
import { authClient, authEnabled } from "./client";

let accountEraseInFlight: ReturnType<typeof eraseAllLocalData> | null = null;

function eraseForAccountBoundary(): ReturnType<typeof eraseAllLocalData> {
  if (accountEraseInFlight) return accountEraseInFlight;
  const operation = eraseAllLocalData();
  accountEraseInFlight = operation;
  void operation.then(
    () => {
      if (accountEraseInFlight === operation) accountEraseInFlight = null;
    },
    () => {
      if (accountEraseInFlight === operation) accountEraseInFlight = null;
    },
  );
  return operation;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Do not even mount the session/storage gate on the cut-down route. Emergency
  // guidance must render during auth outages, a denied storage API, or a
  // multi-second account-boundary erase; the gate resumes on every other path.
  const emergencyBypass = useRouterState({
    select: (state) => state.location.pathname === "/emergency",
  });
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      {authEnabled && !emergencyBypass ? (
        <AccountIsolationGate>{children}</AccountIsolationGate>
      ) : (
        children
      )}
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "#1c1916",
            color: "#f1ebe3",
            border: "1px solid #2a2622",
          },
        }}
      />
    </QueryClientProvider>
  );
}

/**
 * Origin storage is shared by every account that uses this browser profile.
 * Better Auth's hosting-gate integration can replace a cookie session without
 * an explicit in-app sign-out, so the boundary is enforced from the observed
 * session on every render—not only from button handlers.
 *
 * Children remain unmounted until the durable marker matches. On a mismatch we
 * erase, persist the new binding, and hard-reload. The reload is intentional:
 * store modules may already have hydrated the old localStorage snapshot before
 * React reached this provider, and must not be allowed to write it back.
 */
function AccountIsolationGate({ children }: { children: ReactNode }) {
  const { data, error: sessionError, isPending } = authClient.useSession();
  const userId = data?.user?.id ?? null;
  const expectedMarker = accountMarkerFor(userId);
  const [clientReady, setClientReady] = useState(false);
  const [failure, setFailure] = useState<{ marker: string; message: string } | null>(null);
  const [retry, setRetry] = useState(0);
  const [storedMarker, setStoredMarker] = useState<string | null>(null);
  const [markerReadFailed, setMarkerReadFailed] = useState(false);
  const [markerLoaded, setMarkerLoaded] = useState(false);

  useEffect(() => {
    setClientReady(true);
    try {
      setStoredMarker(readAccountMarker());
      setMarkerReadFailed(false);
    } catch {
      setStoredMarker(null);
      setMarkerReadFailed(true);
    } finally {
      setMarkerLoaded(true);
    }
  }, [retry]);

  const markerMatches = markerLoaded && !markerReadFailed && storedMarker === expectedMarker;

  useEffect(() => {
    if (
      !clientReady ||
      isPending ||
      sessionError ||
      markerReadFailed ||
      markerMatches
    ) {
      return;
    }
    let current = true;
    setFailure(null);

    void (async () => {
      // React development Strict Mode can mount an effect twice. Share the
      // erase promise so two IndexedDB deletion requests cannot block each
      // other; only the currently mounted effect writes the account marker.
      const result = await eraseForAccountBoundary();
      if (
        !result.browserStorageCleared ||
        !result.voiceCacheCleared ||
        result.legacyStills !== "deleted_or_absent"
      ) {
        throw new Error(
          "Knotty could not confirm that this browser's prior local data was erased. The app is blocked to prevent account data from crossing sessions.",
        );
      }
      if (!current) return;
      writeAccountMarker(expectedMarker);
      window.location.reload();
    })().catch((cause) => {
      if (!current) return;
      setFailure({
        marker: expectedMarker,
        message:
          cause instanceof Error
            ? cause.message
            : "Knotty could not establish a safe local account boundary.",
      });
    });

    return () => {
      current = false;
    };
  }, [
    clientReady,
    expectedMarker,
    isPending,
    markerMatches,
    markerReadFailed,
    retry,
    sessionError,
  ]);

  if (!clientReady || !markerLoaded || isPending) {
    return <AccountBoundaryStatus message="Checking the local account boundary…" />;
  }
  if (sessionError) {
    return (
      <AccountBoundaryFailure
        message="Knotty could not verify the current account. Local app data remains blocked; no erase was attempted."
        onRetry={() => window.location.reload()}
      />
    );
  }
  if (markerReadFailed) {
    return (
      <AccountBoundaryFailure
        message="Knotty cannot read this browser's account boundary marker. Local app data is blocked."
        onRetry={() => window.location.reload()}
      />
    );
  }
  if (!markerMatches) {
    const currentFailure = failure?.marker === expectedMarker ? failure.message : null;
    return currentFailure ? (
      <AccountBoundaryFailure
        message={currentFailure}
        onRetry={() => setRetry((value) => value + 1)}
      />
    ) : (
      <AccountBoundaryStatus message="Securing local data for this account…" />
    );
  }
  return <>{children}</>;
}

function AccountBoundaryStatus({ message }: { message: string }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-5 text-foreground">
      <div className="text-center">
        <p className="text-sm text-muted" role="status">
          {message}
        </p>
        {/* A hung session check leaves this on screen indefinitely. The
            emergency card bypasses this gate, so offer it rather than making
            someone wait for a check that may never resolve. */}
        <a
          href="/emergency"
          className="mt-4 inline-block text-sm text-danger-text underline underline-offset-4"
        >
          Emergency card
        </a>
      </div>
    </main>
  );
}

function AccountBoundaryFailure({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-5 text-foreground">
      <section className="max-w-md rounded-xl border border-danger/40 bg-surface p-6">
        <h1 className="font-display text-2xl">Local data is blocked</h1>
        <p className="mt-3 text-sm leading-relaxed text-danger-text" role="alert">
          {message}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-white/5"
            onClick={onRetry}
          >
            Retry secure erase
          </button>
          {/* /emergency bypasses this gate entirely (see emergencyBypass above),
              but nothing here said so: a transient session or network failure
              replaced the whole app with this screen and left a retry button as
              the only way forward. A plain anchor rather than a router Link,
              because the router is not necessarily in a good state here. */}
          <a
            href="/emergency"
            className="rounded-md border border-danger px-4 py-2 text-sm font-medium text-danger-text hover:bg-danger/10"
          >
            Emergency card
          </a>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          The emergency card reads no account data and stays available while this
          boundary is blocked.
        </p>
      </section>
    </main>
  );
}
