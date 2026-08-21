import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/emergency")({ component: EmergencyPage });

function EmergencyPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-danger">Stop</p>
      <h1 className="mt-2 font-display text-5xl text-danger">Release now</h1>
      <ol className="mt-8 space-y-4 text-base leading-relaxed">
        <li>
          <span className="text-xs uppercase tracking-wide text-subtle">1 · Stop and release</span>
          <p>Stop the activity. Support the person's position and release restraint without creating a fall or another injury. Use the practiced rapid-release method within your training.</p>
        </li>
        <li>
          <span className="text-xs uppercase tracking-wide text-subtle">2 · Call emergency services</span>
          <p>Call now for abnormal breathing, unresponsiveness, seizure, chest pain, severe bleeding, a serious fall, stroke-like symptoms, major weakness, or any neck pressure followed by concerning symptoms.</p>
        </li>
        <li>
          <span className="text-xs uppercase tracking-wide text-subtle">3 · Follow the dispatcher</span>
          <p>Follow dispatcher instructions. Give CPR, AED care, or first aid only within your current training. Do not use this app instead of emergency care.</p>
        </li>
        <li>
          <span className="text-xs uppercase tracking-wide text-subtle">4 · Prompt medical assessment</span>
          <p>Seek prompt care for persistent or worsening numbness, weakness, pain, swelling, discoloration, temperature change, breathing or swallowing change, voice change, confusion, dizziness, or loss of function.</p>
        </li>
        <li>
          <span className="text-xs uppercase tracking-wide text-subtle">5 · Do not re-tie</span>
          <p>Do not re-tie, delay care for a photo, or use normal-looking color or an app result to rule out injury.</p>
        </li>
      </ol>
      <div className="mt-8 rounded-md border border-danger bg-danger/10 p-4 text-sm" role="alert">
        <p className="font-medium text-danger">Call your local emergency-services number now.</p>
        <p className="mt-1 text-muted">
          Use the device's phone dialer. This emergency card deliberately reads no saved account
          data and will not guess a number from browser language or location.
        </p>
      </div>
    </div>
  );
}
