import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  EMERGENCY_CALL_BODY,
  EMERGENCY_CALL_HEADLINE,
  EMERGENCY_KICKER,
  EMERGENCY_STEPS,
  EMERGENCY_TITLE,
} from "@/lib/emergency-card";

export const Route = createFileRoute("/emergency")({ component: EmergencyPage });

function EmergencyPage() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-danger-text">{EMERGENCY_KICKER}</p>
      <h1 className="mt-2 font-display text-5xl text-danger-text">{EMERGENCY_TITLE}</h1>
      {/* Shared with the offline copy the service worker serves, so the two can
          never drift apart. See src/lib/emergency-card.ts. */}
      <ol className="mt-8 space-y-4 text-base leading-relaxed">
        {EMERGENCY_STEPS.map((step) => (
          <li key={step.label}>
            <span className="text-xs uppercase tracking-wide text-subtle">{step.label}</span>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8 rounded-md border border-danger bg-danger/10 p-4 text-sm" role="alert">
        <p className="font-medium text-danger-text">{EMERGENCY_CALL_HEADLINE}</p>
        <p className="mt-1 text-muted">{EMERGENCY_CALL_BODY}</p>
      </div>
      {/* This page renders outside the app shell (deliberately, so it bypasses
          the consent gate), which also left it with no header, no nav, and no
          way back except the browser's own control. */}
      {/* Comfortable targets, not bare 20px text links: this page gets used
          one-handed and under stress. */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        {online ? (
          <>
            <Link
              to="/checkin"
              className="inline-flex min-h-11 items-center text-fg underline underline-offset-4"
            >
              Log a direct check-in
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-11 items-center text-muted underline underline-offset-4"
            >
              Back to Knotty
            </Link>
          </>
        ) : (
          <p className="text-sm text-warn" role="status">
            Offline — this card is available; other pages need a connection.
          </p>
        )}
      </div>
    </div>
  );
}
