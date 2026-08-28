import { createFileRoute, Link } from "@tanstack/react-router";
import { useChecklist } from "@/lib/stores/checklist";
import { useKit } from "@/lib/stores/kit";
import { useSettings } from "@/lib/stores/settings";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checklist")({ component: ChecklistPage });

const ITEMS = [
  { id: "adults", label: "We're both 18+ and chose this together tonight." },
  { id: "consent", label: "We said yes out loud to what we're doing — maybe still means not tonight." },
  { id: "safewords", label: "Our stop words work, even when hands are busy." },
  { id: "shears", label: "Trauma shears are right here, not in another room." },
  { id: "water", label: "Water and something cozy are within reach." },
  { id: "furniture", label: "The bed or frame is stable — nothing load-bearing we didn't mean to use." },
  { id: "machine", label: "Any toy or machine is off until we want it, with an easy stop." },
  { id: "camera", label: "We're happy to use the camera and Analyze if we feel like it." },
  { id: "clock", label: "Reminders are just nudges to check in — not a timer that overrides us." },
  { id: "exit", label: "We know how to untie fast if either of us needs out." },
] as const;

function ChecklistPage() {
  const done = useChecklist((s) => s.done);
  const setDone = useChecklist((s) => s.setDone);
  const shears = useKit((s) => s.shears);
  const eights = useKit((s) => s.eights);
  const safeword = useSettings((s) => s.safeword);
  const ready = ITEMS.every((i) => done[i.id]);

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Before rope</p>
      <h1 className="mt-2 font-display text-4xl">Pre-scene</h1>
      <p className="mt-3 text-sm text-muted">
        Ten sweet checks before you begin. Your stop word is <strong className="text-fg">{safeword}</strong>.
        Your kit lists {eights} × 8m lengths{shears ? " and trauma shears" : ""}.
      </p>
      <ul className="mt-8 space-y-3">
        {ITEMS.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-accent"
                checked={!!done[item.id]}
                onChange={(e) => setDone(item.id, e.target.checked)}
              />
              <span>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-2">
        {ready ? (
          <Button asChild>
            <Link to="/studio">Open studio</Link>
          </Button>
        ) : (
          <Button disabled>Open studio</Button>
        )}
        <Button asChild variant="outline">
          <Link to="/negotiate">Negotiate</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/plan">Plan</Link>
        </Button>
      </div>
      {!ready && (
        <p className="mt-4 text-xs text-subtle">Tick each box together when it's true for you both.</p>
      )}
    </div>
  );
}
