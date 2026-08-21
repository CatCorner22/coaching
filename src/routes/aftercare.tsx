import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

export const Route = createFileRoute("/aftercare")({ component: AftercarePage });

const CHECKS = [
  "Rope is off. Shears away from skin.",
  "Blanket, water, sugar if she wants it.",
  "Hands and feet: color, heat, squeeze, which finger.",
  "Shoulders and knees uncurled slowly.",
  "Marks photographed only if she asked for that.",
  "She speaks in full sentences before you talk about the next scene.",
  "You stay until she is oriented — drop can arrive late.",
  "Write the journal tomorrow, not while she is still shaking.",
];

function AftercarePage() {
  const [done, setDone] = useState<boolean[]>(() => CHECKS.map(() => false));
  const [t, setT] = useState(0);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run) return;
    const id = window.setInterval(() => setT((x) => x + 1), 1000);
    return () => window.clearInterval(id);
  }, [run]);
  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Landing</p>
      <h1 className="mt-2 font-display text-4xl">Aftercare</h1>
      <p className="mt-3 text-sm text-muted">
        The scene is not over when the last wrap comes off. Sit with her. Dominance is still
        attention.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <p className="font-display text-4xl tabular-nums">{formatDuration(t)}</p>
        <Button onClick={() => setRun((v) => !v)}>{run ? "Pause" : "Start sit"}</Button>
        <Button variant="ghost" onClick={() => setT(0)}>
          Reset
        </Button>
      </div>
      <ul className="mt-8 space-y-2">
        {CHECKS.map((c, i) => (
          <li key={c}>
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-surface px-3 py-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={done[i]}
                onChange={(e) =>
                  setDone((d) => d.map((x, j) => (j === i ? e.target.checked : x)))
                }
              />
              {c}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
