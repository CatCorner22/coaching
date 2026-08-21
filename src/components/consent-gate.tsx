import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/stores/settings";

export function ConsentGate({ children }: { children: React.ReactNode }) {
  const consented = useSettings((s) => s.consented);
  const adultsOk = useSettings((s) => s.adults);
  const shearsOk = useSettings((s) => s.shears);
  const photosOk = useSettings((s) => s.photosOk);
  const set = useSettings((s) => s.set);
  const enter = useSettings((s) => s.enter);
  const [mounted, setMounted] = useState(false);
  const [adults, setAdults] = useState(false);
  const [shears, setShears] = useState(false);
  const [photos, setPhotos] = useState(false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setMounted(true);
    };
    const api = useSettings.persist;
    const unsub = api.onFinishHydration(finish);
    if (api.hasHydrated()) finish();
    const t = window.setTimeout(finish, 80);
    return () => {
      unsub();
      window.clearTimeout(t);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg px-5 py-10">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Knotty</p>
          <h1 className="mt-3 font-display text-4xl leading-none text-fg">Enter the studio</h1>
          <p className="mt-4 text-sm text-muted">Loading your consent on this device…</p>
        </div>
      </div>
    );
  }
  if (consented && adultsOk && shearsOk && photosOk) return <>{children}</>;

  const ready = adults && shears && photos && consent;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-5 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Knotty</p>
        <h1 className="mt-3 font-display text-4xl leading-none text-fg">Enter the studio</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          This is a private studio for a consenting adult couple. You will photograph and
          record your partner — often nude — to coach rope. Stills stay on this device unless
          you ask Grok to read them.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-fg">
          <Check checked={adults} onChange={setAdults} label="Everyone involved is 18 or older." />
          <Check
            checked={consent}
            onChange={setConsent}
            label="She has enthusiastic, ongoing consent, including being photographed in rope."
          />
          <Check
            checked={shears}
            onChange={setShears}
            label="Trauma shears are in reach before the first wrap."
          />
          <Check
            checked={photos}
            onChange={setPhotos}
            label="I understand Analyze sends a compressed still to Grok for coaching, then discards it on the server."
          />
        </ul>
        <Button
          className="mt-7 w-full"
          size="lg"
          disabled={!ready}
          onClick={() => {
            set({ adults: true, shears: true, photosOk: true });
            enter();
          }}
        >
          Enter
        </Button>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          An app cannot replace a teacher with hands on the rope. Knotty will refuse neck
          restraint, breath play, and full suspension.
        </p>
      </div>
    </div>
  );
}

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <li>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-accent"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{label}</span>
      </label>
    </li>
  );
}
