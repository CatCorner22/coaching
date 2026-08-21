import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCheckIn, type Breath, type Color } from "@/lib/stores/checkin";
import { useSession } from "@/lib/stores/session";

export const Route = createFileRoute("/checkin")({ component: CheckInPage });

function CheckInPage() {
  const logs = useCheckIn((s) => s.logs);
  const add = useCheckIn((s) => s.add);
  const checked = useSession((s) => s.checked);
  const [color, setColor] = useState<Color>("pink");
  const [tingle, setTingle] = useState(false);
  const [breath, setBreath] = useState<Breath>("easy");
  const [whichFinger, setWhichFinger] = useState("");
  const [note, setNote] = useState("");
  const alarm = color !== "pink" || tingle || breath === "hard";

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Hands</p>
      <h1 className="mt-2 font-display text-4xl">Check-in</h1>
      <p className="mt-3 text-sm text-muted">
        Same five questions every time so the answers compare. Pale plus cold plus buzz is a strip,
        not a wait.
      </p>
      <fieldset className="mt-8">
        <legend className="text-xs uppercase tracking-wide text-subtle">Color</legend>
        <div className="mt-2 flex gap-2">
          {(["pink", "pale", "dusky"] as const).map((c) => (
            <Button key={c} variant={color === c ? "default" : "outline"} size="sm" onClick={() => setColor(c)}>
              {c}
            </Button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-6">
        <legend className="text-xs uppercase tracking-wide text-subtle">Breathing</legend>
        <div className="mt-2 flex gap-2">
          {(["easy", "work", "hard"] as const).map((b) => (
            <Button key={b} variant={breath === b ? "default" : "outline"} size="sm" onClick={() => setBreath(b)}>
              {b}
            </Button>
          ))}
        </div>
      </fieldset>
      <label className="mt-6 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={tingle} onChange={(e) => setTingle(e.target.checked)} />
        Tingling or buzzing
      </label>
      <input
        className="mt-3 h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm"
        placeholder="Which finger?"
        value={whichFinger}
        onChange={(e) => setWhichFinger(e.target.value)}
      />
      <textarea
        className="mt-3 h-20 w-full rounded-md border border-border bg-elevated p-3 text-sm"
        placeholder="Anything else she said"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {alarm && (
        <p className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          This is a stop-adding reading. Strip the wrap on that limb. Do not bargain.
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          onClick={() => {
            add({ color, tingle, breath, whichFinger, note });
            checked();
            if (alarm) useSession.getState().stop("checkin");
          }}
        >
          {alarm ? "Save and halt" : "Save check-in"}
        </Button>
        <Button asChild variant="outline">
          <Link to="/studio">Back to studio</Link>
        </Button>
        {alarm && (
          <Button asChild variant="danger">
            <Link to="/emergency">Cut-down card</Link>
          </Button>
        )}
      </div>
      <h2 className="mt-12 font-display text-2xl">This session</h2>
      {logs.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No check-ins yet.</p>
      ) : (
        <ol className="mt-4 space-y-2">
          {logs.map((l) => (
            <li key={l.id} className="rounded-md border border-border bg-surface px-3 py-2 text-sm">
              <p className="text-xs text-subtle">{new Date(l.at).toLocaleTimeString()}</p>
              <p>
                {l.color}
                {l.tingle ? " · tingle" : ""} · breath {l.breath}
                {l.whichFinger ? ` · ${l.whichFinger}` : ""}
              </p>
              {l.note && <p className="mt-1 text-muted">{l.note}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
