import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useKit } from "@/lib/stores/kit";
import { useSettings } from "@/lib/stores/settings";

export const Route = createFileRoute("/checklist")({ component: ChecklistPage });

const ITEMS = [
  { id: "adults", label: "Everyone involved is 18 or older." },
  { id: "consent", label: "Tonight's yes / maybe / no was said out loud." },
  { id: "safewords", label: "Red, yellow, green are agreed and she can still say them." },
  { id: "shears", label: "Trauma shears are on the scene, not in another room." },
  { id: "water", label: "Water and a blanket are within reach." },
  { id: "furniture", label: "The bench / table / swing / cross is set before rope goes on." },
  { id: "machine", label: "Hismith is off. Kill switch is in your hand's path." },
  { id: "camera", label: "She is fine with stills or clips for coaching tonight." },
  { id: "clock", label: "A timer exists that is not 'I'll remember'." },
  { id: "exit", label: "You both know the first thing you cut if it goes red." },
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
        Ten things that are cheaper than a nerve injury. Safeword is {safeword}. You have {eights} ×
        8m staffs{shears ? " and shears logged in the kit" : ""}.
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
        <p className="mt-4 text-xs text-subtle">Studio still opens from the nav if you insist. This list is the grown-up path.</p>
      )}
    </div>
  );
}
