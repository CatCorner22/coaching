import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

export const Route = createFileRoute("/aftercare")({ component: AftercarePage });

const CHECKS = [
  "Rope is off and release tools are away from skin.",
  "Offer warmth, water, food, quiet, or space according to the person's current preference.",
  "Ask directly about sensation, movement, pain, swelling, temperature change, breathing, speech, and alertness.",
  "Do not force a joint or limb through resistance while changing position.",
  "Make no photo unless recording and output permissions are separately current and specific.",
  "Call emergency services now for unresponsiveness, abnormal breathing, severe confusion, collapse, or another emergency sign.",
  "Prompt medical assessment for persistent or worsening weakness, numbness, severe pain, swelling, or temperature change.",
  "Delay journaling until everyone is stable and willing; do not use a normal-looking image as reassurance.",
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
        The activity is not over when the last wrap comes off. Follow the person’s current wishes,
        check directly, and escalate concerning symptoms without waiting for this checklist.
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
