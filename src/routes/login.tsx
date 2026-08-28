import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getAuthCapabilitiesBounded,
  type AuthCapabilities,
} from "@/lib/auth/capabilities";
import { authEnabled, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { mediaUploadScope, uploadScopeLoginLine } from "@/lib/media-scope";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<AuthCapabilities | null>(null);
  const [capabilityError, setCapabilityError] = useState<string | null>(null);
  const [capabilityAttempt, setCapabilityAttempt] = useState(0);

  useEffect(() => {
    if (!authEnabled) return;
    let current = true;
    setCapabilityError(null);
    void getAuthCapabilitiesBounded()
      .then((next) => {
        if (current) {
          setCapabilities(next);
          setCapabilityError(null);
        }
      })
      .catch(() => {
        if (current) {
          setCapabilities(null);
          setCapabilityError("Sign-in capabilities could not be verified.");
        }
      });
    return () => {
      current = false;
    };
  }, [capabilityAttempt]);

  if (!authEnabled || user) return <Navigate to="/" />;

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md items-center px-5 py-10">
      <section className="w-full rounded-xl border border-border bg-surface p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Knotty · just us</p>
        <h1 className="mt-3 font-display text-4xl leading-none">Sign in together</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Your private rope studio. Sign in once — then one checkbox on the home screen unlocks
          everything, including Studio Analyze when you choose it.
        </p>
        {isPending ? (
          <p className="mt-6 text-sm text-muted" role="status">
            Checking your session…
          </p>
        ) : capabilities === null ? (
          capabilityError ? (
            <div className="mt-6 rounded-lg border border-danger/40 p-4">
              <p className="text-sm text-danger-text" role="alert">
                {capabilityError} Cloud analysis remains unavailable until this check succeeds.
              </p>
              <Button
                className="mt-3"
                variant="outline"
                onClick={() => setCapabilityAttempt((attempt) => attempt + 1)}
              >
                Retry sign-in check
              </Button>
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted" role="status">
              Checking sign-in availability…
            </p>
          )
        ) : capabilities.oauthProviders ? (
          <div className="mt-6 grid gap-3">
            {GROK_PROVIDERS.map((provider) => (
              <Button
                key={provider.providerId}
                variant="outline"
                disabled={activeProvider !== null}
                onClick={() => {
                  setError(null);
                  setActiveProvider(provider.providerId);
                  void signIn(provider.providerId, { callbackURL: "/", errorCallbackURL: "/login" })
                    .catch((cause) => {
                      setError(cause instanceof Error ? cause.message : "Sign-in could not start.");
                      setActiveProvider(null);
                    });
                }}
              >
                {activeProvider === provider.providerId
                  ? `Opening ${provider.label}…`
                  : `Continue with ${provider.label}`}
              </Button>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm leading-relaxed text-muted" role="status">
            {capabilities.gateIdentity
              ? "This deployment uses its hosting access gate. Open the app through that gate, then reload this page if your session is not detected."
              : "No sign-in provider is configured for this deployment. Cloud analysis remains unavailable."}
          </p>
        )}
        {error && (
          <p className="mt-4 text-sm text-danger-text" role="alert">
            {error}
          </p>
        )}
        <p className="mt-6 text-xs leading-relaxed text-subtle">
          Sign-in does not make an image anonymous or verify consent, age, physiology, technique,
          or safety. {uploadScopeLoginLine(mediaUploadScope())}
          To prevent one account from inheriting another person's notes on a shared device, starting
          or ending an account session clears Knotty's local settings, negotiation, plan, and journal.
        </p>
      </section>
    </div>
  );
}
