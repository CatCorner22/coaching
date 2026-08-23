import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useKit } from "@/lib/stores/kit";
import { useSettings } from "@/lib/stores/settings";

export const Route = createFileRoute("/checklist")({ component: ChecklistPage });

const ITEMS = [
  { id: "adults", label: "Everyone involved is 18 or older." },
  { id: "consent", label: "Today's specific yes / maybe / no was confirmed directly; maybe still means no." },
  { id: "safewords", label: "Verbal and non-verbal stop channels were agreed and tested while unrestrained." },
  { id: "shears", label: "Trauma shears are on the scene, not in another room." },
  { id: "water", label: "Water and a blanket are within reach." },
  { id: "furniture", label: "Furniture is stable and remains non-load-bearing; no household anchor is assumed rated." },
  { id: "machine", label: "Any machine is off, and its emergency stop is unobstructed and directly tested." },
  { id: "camera", label: "If using media, adult/activity/recording/upload/output permissions and the non-explicit, non-secret scope are current." },
  { id: "clock", label: "Any reminder is only a prompt to check directly, never a safe-duration guarantee." },
  { id: "exit", label: "The release plan was practiced unrestrained; emergency actions stay within your training and dispatcher instructions." },
] as const;

function ChecklistPage() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const shears = useKit((s) => s.shears);
  const eights = useKit((s) => s.eights);
  const safeword = useSettings((s) => s.safeword);
  const ready = ITEMS.every((i) => done[i.id]);

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Before rope</p>
      <h1 className="mt-2 font-display text-4xl">Pre-scene</h1>
      <p className="mt-3 text-sm text-muted">
        Ten prompts to verify directly before any activity. Your saved stop word is {safeword}. Your
        kit lists {eights} × 8m lengths{shears ? " and trauma shears" : ""}; a checked box is not proof of safety.
      </p>
      <ul className="mt-8 space-y-3">
        {ITEMS.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-accent"
                checked={!!done[item.id]}
                onChange={(e) => setDone((d) => ({ ...d, [item.id]: e.target.checked }))}
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
        <p className="mt-4 text-xs text-subtle">Complete each item directly with everyone involved before opening Studio.</p>
      )}
    </div>
  );
}
