import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/stores/settings";

export const Route = createFileRoute("/settings")({
  ssr: false,
  component: SettingsPage,
});

function SettingsPage() {
  const s = useSettings();
  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Protocol</p>
      <h1 className="mt-2 font-display text-4xl">Settings</h1>
      <div className="mt-8 space-y-4">
        <Field label="Your name / title" value={s.riggerName} onChange={(v) => s.set({ riggerName: v })} />
        <Field label="Hers" value={s.bottomName} onChange={(v) => s.set({ bottomName: v })} />
        <Field label="Honorific if she uses one" value={s.honorific} onChange={(v) => s.set({ honorific: v })} />
        <label className="block text-sm">
          <span className="text-xs uppercase tracking-wide text-subtle">Dynamic</span>
          <select
            className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3"
            value={s.style}
            onChange={(e) => s.set({ style: e.target.value as "peer" | "ds" })}
          >
            <option value="ds">D/s — coach the rigger, keep her in the scene</option>
            <option value="peer">Peer — two adults, no protocol</option>
          </select>
        </label>
        <Field label="Red" value={s.safeword} onChange={(v) => s.set({ safeword: v })} />
        <Field label="Yellow" value={s.yellowWord} onChange={(v) => s.set({ yellowWord: v })} />
        <Field label="Green" value={s.greenWord} onChange={(v) => s.set({ greenWord: v })} />
        <label className="block text-sm">
          <span className="text-xs uppercase tracking-wide text-subtle">Direct-check reminder (minutes; not a safety interval)</span>
          <input
            type="number"
            min={2}
            max={8}
            className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3"
            value={s.circulationMins}
            onChange={(e) => s.set({ circulationMins: Number(e.target.value) || 4 })}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={s.voice} onChange={(e) => s.set({ voice: e.target.checked })} />
          Speak coaching
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={s.listen} onChange={(e) => s.set({ listen: e.target.checked })} />
          Optional microphone word detection
        </label>
        <p className="text-xs leading-relaxed text-subtle">
          Browser speech recognition can fail silently or use a cloud speech service. It is never a
          safeword system or substitute for direct communication and agreed nonverbal signals.
        </p>
        <Button variant="outline" onClick={() => s.set({ consented: false })}>
          Reset consent gate
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs uppercase tracking-wide text-subtle">{label}</span>
      <input
        className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
