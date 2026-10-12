import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getAuthCapabilitiesBounded,
  type AuthCapabilities,
} from "@/lib/auth/capabilities";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useSettings } from "@/lib/stores/settings";

export function ConsentGate({ children }: { children: React.ReactNode }) {
  const consented = useSettings((s) => s.consented);
  const enter = useSettings((s) => s.enter);
  const { user, isPending: authPending } = useCurrentUserState();
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [capabilities, setCapabilities] = useState<AuthCapabilities | null>(null);

  useEffect(() => {
    const finish = () => setMounted(true);
    const api = useSettings.persist;
    const unsubscribe = api.onFinishHydration(finish);
    if (api.hasHydrated()) finish();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authEnabled) return;
    let current = true;
    void getAuthCapabilitiesBounded()
      .then((next) => {
        if (current) setCapabilities(next);
      })
      .catch(() => {
        if (current) setCapabilities({ gateIdentity: false, oauthProviders: false });
      });
    return () => {
      current = false;
    };
  }, []);

  if (!mounted || authPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg px-5 py-10">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Knotty</p>
          <h1 className="mt-3 font-display text-4xl leading-none text-fg">Our rope studio</h1>
          <p className="mt-4 text-sm text-muted">Loading your studio…</p>
        </div>
      </div>
    );
  }

  const signInRequired =
    authEnabled &&
    !user &&
    Boolean(capabilities?.oauthProviders || capabilities?.gateIdentity);

  if (signInRequired) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg px-5 py-10">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Knotty · just us</p>
          <h1 className="mt-3 font-display text-4xl leading-none text-fg">Sign in together</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            This is your private studio. Sign in once, then one simple yes on the home screen —
            camera, Studio Analyze, and your saved words stay between you two.
          </p>
          <Button asChild className="mt-7 w-full" size="lg">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (consented) return <>{children}</>;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-5 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Knotty · just us</p>
        <h1 className="mt-3 font-display text-4xl leading-none text-fg">Tonight is ours</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          A playful rope studio for the two of you — learning, planning, camera preview, and optional
          cloud analysis when you choose it. Shears within reach, safewords honored, aftercare
          included.
        </p>
        <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-fg">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-accent"
            checked={ready}
            onChange={(e) => setReady(e.target.checked)}
          />
          <span>
            We're both adults, we chose this together for tonight, and we're happy to use the camera
            and Studio Analyze when we want. Nobody is recorded in secret or under pressure, and
            everyone in frame has agreed.
          </span>
        </label>
        <Button
          className="mt-7 w-full"
          size="lg"
          disabled={!ready}
          onClick={() => {
            enter();
          }}
        >
          Step inside
        </Button>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          Reset consent anytime in Settings. Analyze sends your selected stills to xAI only when you tap it — never in the background.
        </p>
      </div>
    </div>
  );
}
