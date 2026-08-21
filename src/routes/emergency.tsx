import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/emergency")({ component: EmergencyPage });

function EmergencyPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-danger">Stop</p>
      <h1 className="mt-2 font-display text-5xl text-danger">Cut down</h1>
      <ol className="mt-8 space-y-4 text-base leading-relaxed">
        <li>
          <span className="text-xs uppercase tracking-wide text-subtle">1 · Shears</span>
          <p>Trauma shears. Not a kitchen knife. Slide the blunt edge against skin.</p>
        </li>
        <li>
          <span className="text-xs uppercase tracking-wide text-subtle">2 · Tensioned stems first</span>
          <p>Cut what is holding load. Then the wrap that is going pale. Then the rest.</p>
        </li>
        <li>
          <span className="text-xs uppercase tracking-wide text-subtle">3 · Airway</span>
          <p>If she is quiet or blue, get rope off the chest and sit her up if she can. No neck rope should have existed.</p>
        </li>
        <li>
          <span className="text-xs uppercase tracking-wide text-subtle">4 · Hands</span>
          <p>If a hand is white or she cannot move it, the rope is already too late — cut, then warmth, then medical if it does not return.</p>
        </li>
        <li>
          <span className="text-xs uppercase tracking-wide text-subtle">5 · Call</span>
          <p>Numbness that lasts, foot-drop, chest pain, fainting: emergency services. Pride is not a treatment.</p>
        </li>
      </ol>
      <a
        href="tel:911"
        className="mt-8 flex h-12 items-center justify-center rounded-md bg-danger text-sm font-medium text-danger-fg"
      >
        Call 911
      </a>
    </div>
  );
}
