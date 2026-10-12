import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useCheckIn,
  type CheckIn,
  type CheckChoice,
  type ConsentChoice,
} from "@/lib/stores/checkin";
import { useSession } from "@/lib/stores/session";

export const Route = createFileRoute("/checkin")({ component: CheckInPage });

function CheckInPage() {
  const logs = useCheckIn((state) => state.logs);
  const add = useCheckIn((state) => state.add);
  const checked = useSession((state) => state.checked);
  const [consent, setConsent] = useState<ConsentChoice>("not_checked");
  const [sensation, setSensation] = useState<CheckChoice>("not_checked");
  const [movement, setMovement] = useState<CheckChoice>("not_checked");
  const [breathingSpeechAlertness, setBreathingSpeechAlertness] = useState<CheckChoice>("not_checked");
  const [painSwellingTemperature, setPainSwellingTemperature] = useState<CheckChoice>("not_checked");
  const [emergencySigns, setEmergencySigns] = useState<CheckChoice>("not_checked");
  const [note, setNote] = useState("");
  const choices = [sensation, movement, breathingSpeechAlertness, painSwellingTemperature, emergencySigns];
  const ready = consent !== "not_checked" && choices.every((choice) => choice !== "not_checked");
  const [lastLogged, setLastLogged] = useState<{ concern: boolean; emergency: boolean } | null>(null);
  const concern = consent === "no" || choices.includes("concern");
  const emergency = emergencySigns === "concern";
  // After a log the inputs reset, but the guidance for what was just logged
  // must stay up until the user starts a new check-in.
  const formBlank = consent === "not_checked" && choices.every((choice) => choice === "not_checked");
  const showConcern = concern || (formBlank && lastLogged?.concern === true);
  const showEmergency = emergency || (formBlank && lastLogged?.emergency === true);

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Direct report</p>
      <h1 className="mt-2 font-display text-4xl">Check-in</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Ask directly and record each answer; nothing defaults to normal. Images and timers cannot
        answer these questions. Release for any concern or uncertainty.
      </p>

      <div className="mt-8 space-y-6">
        <ConsentField value={consent} onChange={setConsent} />
        <CheckField
          legend="Sensation"
          help="Any new numbness, tingling, burning, altered feeling, or inability to describe sensation?"
          value={sensation}
          onChange={setSensation}
        />
        <CheckField
          legend="Movement and strength"
          help="Any new weakness, loss of grip, reduced movement, or inability to move normally?"
          value={movement}
          onChange={setMovement}
        />
        <CheckField
          legend="Breathing, speech, and alertness"
          help="Any breathing or voice change, trouble speaking, confusion, panic, faintness, or unusual drowsiness?"
          value={breathingSpeechAlertness}
          onChange={setBreathingSpeechAlertness}
        />
        <CheckField
          legend="Pain, swelling, temperature, or color change"
          help="Any severe or escalating pain, swelling, coldness, marked discoloration, or other worsening change?"
          value={painSwellingTemperature}
          onChange={setPainSwellingTemperature}
        />
        <CheckField
          legend="Emergency signs"
          help="Abnormal breathing, unresponsiveness, seizure, chest pain, a serious fall, stroke-like signs, major weakness, severe confusion, or concerning symptoms after neck pressure?"
          value={emergencySigns}
          onChange={setEmergencySigns}
        />
      </div>

      <label htmlFor="checkin-note" className="mt-6 block text-xs uppercase tracking-wide text-subtle">
        Optional session-only note (240 characters; no identifying details)
      </label>
      <textarea
        id="checkin-note"
        maxLength={240}
        className="mt-1 h-20 w-full rounded-md border border-border bg-elevated p-3 text-sm"
        placeholder="Optional session-only note; do not include identifying details"
        value={note}
        onChange={(event) => setNote(event.target.value.slice(0, 240))}
      />

      {showConcern && (
        <div className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-text" role="alert">
          Release now and do not re-tie. {showEmergency
            ? "Call local emergency services and follow dispatcher instructions."
            : "Seek prompt medical assessment for persistent or worsening symptoms; use emergency services if an emergency sign develops."}
          {" "}A normal-looking image cannot rule out injury.
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          className="h-auto whitespace-normal py-2 text-left"
          disabled={!ready}
          onClick={() => {
            if (!ready) return;
            add({
              consent,
              sensation,
              movement,
              breathingSpeechAlertness,
              painSwellingTemperature,
              emergencySigns,
              note,
            });
            checked();
            if (concern) useSession.getState().stop(emergency ? "medical-emergency" : "checkin-concern");
            setLastLogged({ concern, emergency });
            // Clear the form so the next check-in starts blank: a logged answer
            // left selected would pre-fill the next report, and nothing here
            // may default to normal.
            setConsent("not_checked");
            setSensation("not_checked");
            setMovement("not_checked");
            setBreathingSpeechAlertness("not_checked");
            setPainSwellingTemperature("not_checked");
            setEmergencySigns("not_checked");
            setNote("");
          }}
        >
          {!ready ? "Complete every direct check" : concern ? "Log and halt" : "Log direct check"}
        </Button>
        <Button asChild variant="outline">
          <Link to="/studio">Back to studio</Link>
        </Button>
        {showConcern && (
          <Button asChild variant="danger">
            <Link to="/emergency">Emergency card</Link>
          </Button>
        )}
      </div>

      <h2 className="mt-12 font-display text-2xl">This tab only</h2>
      <p className="mt-1 text-xs text-subtle">Check-ins are not written to browser storage.</p>
      {logs.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No completed direct check-ins in this tab.</p>
      ) : (
        <ol className="mt-4 space-y-2">
          {logs.map((entry) => (
            <li key={entry.id} className="rounded-md border border-border bg-surface px-3 py-2 text-sm">
              <p className="text-xs text-subtle">{new Date(entry.at).toLocaleTimeString()}</p>
              <p>{entry.consent === "yes" ? "consent confirmed" : "consent not confirmed"} · {hasConcern(entry) ? "concern logged" : "no concern reported"}</p>
              {entry.note && <p className="mt-1 text-muted">{entry.note}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function ConsentField({ value, onChange }: { value: ConsentChoice; onChange: (value: ConsentChoice) => void }) {
  return (
    <fieldset>
      <legend className="text-xs uppercase tracking-wide text-subtle">Current consent</legend>
      <p className="mt-1 text-xs text-muted">Does the person directly confirm they want the activity to continue right now?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Choice active={value === "yes"} onClick={() => onChange("yes")}>Yes, directly confirmed</Choice>
        <Choice active={value === "no"} onClick={() => onChange("no")}>No or uncertain</Choice>
      </div>
    </fieldset>
  );
}

function CheckField({
  legend,
  help,
  value,
  onChange,
}: {
  legend: string;
  help: string;
  value: CheckChoice;
  onChange: (value: CheckChoice) => void;
}) {
  return (
    <fieldset>
      <legend className="text-xs uppercase tracking-wide text-subtle">{legend}</legend>
      <p className="mt-1 text-xs text-muted">{help}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Choice active={value === "no_concern"} onClick={() => onChange("no_concern")}>No concern reported</Choice>
        <Choice active={value === "concern"} onClick={() => onChange("concern")}>Concern or uncertain</Choice>
      </div>
    </fieldset>
  );
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  // aria-pressed: selection was conveyed only by a visual variant swap, so a
  // screen reader could not tell which answer was chosen.
  return (
    <Button
      type="button"
      aria-pressed={active}
      variant={active ? "default" : "outline"}
      size="sm"
      // Buttons are nowrap by default. These labels are sentences, and at a
      // narrow layout viewport the concern answer — always the longer, second
      // one — was the half that ran off the edge.
      className="h-auto whitespace-normal py-2 text-left"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function hasConcern(entry: CheckIn): boolean {
  return (
    entry.consent !== "yes" ||
    entry.sensation === "concern" ||
    entry.movement === "concern" ||
    entry.breathingSpeechAlertness === "concern" ||
    entry.painSwellingTemperature === "concern" ||
    entry.emergencySigns === "concern"
  );
}
