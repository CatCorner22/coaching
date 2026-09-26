import { ShieldAlert, Volume2 } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { bulletsOrFallback, isSayableAloud } from "@/lib/learn/plain-language";
import { cn } from "@/lib/utils";
import type { StepConfirm } from "./step-confirm";

export type { StepConfirm } from "./step-confirm";

type StepCardProps = {
  index: number;
  total: number;
  title: string;
  stepGoal?: string;
  doText: string;
  checkText: string;
  doBullets?: string[];
  checkBullets?: string[];
  speak: string;
  onSpeak: () => void;
  voiceLabel: string;
  confirm: StepConfirm;
  onConfirmChange: (next: StepConfirm) => void;
  requireConfirm?: boolean;
  media?: React.ReactNode;
  className?: string;
};

export function StepCard({
  index,
  total,
  title,
  stepGoal,
  doText,
  checkText,
  doBullets,
  checkBullets,
  speak,
  onSpeak,
  voiceLabel,
  confirm,
  onConfirmChange,
  requireConfirm = true,
  media,
  className,
}: StepCardProps) {
  const doLines = bulletsOrFallback(doBullets, doText);
  const checkLines = bulletsOrFallback(checkBullets, checkText);
  const sayable = isSayableAloud(speak);
  const doGroupId = useId();
  const checkGroupId = useId();

  return (
    <article className={cn("academy-step-card easy-read rounded-xl border border-border bg-surface p-5 sm:p-6", className)}>
      <header className="space-y-3">
        <p className="text-sm font-medium text-accent">
          Step {index + 1} of {total}
        </p>
        <h2 className="font-display text-2xl leading-snug sm:text-3xl">{title}</h2>
        {stepGoal && (
          <p className="rounded-lg border border-border/60 bg-elevated/40 px-4 py-3 text-base leading-relaxed text-fg">
            <span className="block text-xs font-medium uppercase tracking-wide text-subtle">This step in one line</span>
            {stepGoal}
          </p>
        )}
      </header>

      {media && (
        <div className="academy-media mt-5 overflow-hidden rounded-lg border border-border bg-elevated">{media}</div>
      )}

      <div className="mt-6 space-y-5">
        <InstructionBlock
          num={1}
          label="What to do"
          hint="Do these in order. Tap each box when done."
          lines={doLines}
          groupId={doGroupId}
          checked={confirm.didDo}
          onChecked={(didDo) => onConfirmChange({ ...confirm, didDo })}
          tone="do"
          requireConfirm={requireConfirm}
        />
        {(doBullets?.length || checkBullets?.length) && (
          <details className="rounded-lg border border-border/40 px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-muted">Why</summary>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
              <p>{doText}</p>
              <p>{checkText}</p>
            </div>
          </details>
        )}

        <InstructionBlock
          num={2}
          label="Look and check"
          hint="Stop and look before you go on."
          lines={checkLines}
          groupId={checkGroupId}
          checked={confirm.didCheck}
          onChecked={(didCheck) => onConfirmChange({ ...confirm, didCheck })}
          tone="check"
          requireConfirm={requireConfirm}
        />

        {/* Part three is "say out loud" only when there is something to say.
            On an instructor route the line is a scope notice, and printing it
            under this heading told the reader to recite the sentence that says
            this app will not teach them the entry. The Listen button stays
            either way — it reads the whole step, not just this line. */}
        <section className="rounded-lg border border-border/40 px-4 py-4 sm:px-5 sm:py-5" aria-labelledby={`${doGroupId}-say`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={
                  sayable
                    ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-elevated text-sm font-semibold text-fg"
                    : "flex size-9 shrink-0 items-center justify-center rounded-full bg-warn/15 text-sm font-semibold text-warn"
                }
              >
                {sayable ? "3" : <ShieldAlert className="size-4" aria-hidden />}
              </span>
              <div>
                <h3 id={`${doGroupId}-say`} className="text-base font-medium text-fg">
                  {sayable ? "Say out loud" : "What this entry is"}
                </h3>
                <p className="text-sm text-muted">
                  {sayable
                    ? "Optional — tap Listen if reading is hard."
                    : "Scope, not a line to say. Tap Listen to hear the step."}
                </p>
              </div>
            </div>
            <Button variant="secondary" size="lg" onClick={onSpeak} className="shrink-0">
              <Volume2 className="size-4" aria-hidden />
              {voiceLabel}
            </Button>
          </div>
          <p
            className={
              sayable
                ? "mt-4 rounded-md bg-elevated/50 px-4 py-3 text-base leading-relaxed text-fg"
                : "mt-4 rounded-md border border-warn/25 bg-warn/8 px-4 py-3 text-base leading-relaxed text-fg"
            }
          >
            {speak}
          </p>
        </section>
      </div>

      {requireConfirm && !(confirm.didDo && confirm.didCheck) && (
        <p className="mt-5 rounded-lg border border-warn/30 bg-warn/8 px-4 py-3 text-sm leading-relaxed text-warn">
          Check both boxes above before you press Next. This helps you not skip a step.
        </p>
      )}
    </article>
  );
}

function InstructionBlock({
  num,
  label,
  hint,
  lines,
  groupId,
  checked,
  onChecked,
  tone,
  requireConfirm,
}: {
  num: number;
  label: string;
  hint: string;
  lines: string[];
  groupId: string;
  checked: boolean;
  onChecked: (checked: boolean) => void;
  tone: "do" | "check";
  requireConfirm: boolean;
}) {
  const isDo = tone === "do";
  return (
    <section
      className={cn(
        "rounded-lg border px-4 py-4 sm:px-5 sm:py-5",
        isDo ? "border-border/60 bg-elevated/50" : "border-ok/25 bg-ok/5",
      )}
      aria-labelledby={`${groupId}-heading`}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
            isDo ? "bg-accent text-accent-fg" : "bg-ok/20 text-ok",
          )}
        >
          {num}
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={`${groupId}-heading`} className="text-base font-medium text-fg">
            {label}
          </h3>
          <p className="mt-0.5 text-sm text-muted">{hint}</p>
          <ol className="mt-4 space-y-3">
            {lines.map((line, i) => (
              <li key={line + i} className="flex gap-3 text-base leading-relaxed text-fg">
                <span
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-medium text-muted ring-1 ring-border"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
          {requireConfirm && (
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-md border border-border bg-surface px-3 py-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChecked(e.target.checked)}
                className="mt-1 size-5 shrink-0 accent-[var(--color-accent)]"
              />
              <span className="text-base leading-snug text-fg">
                {isDo ? "I did everything in the list above." : "I looked and everything matches the check list."}
              </span>
            </label>
          )}
        </div>
      </div>
    </section>
  );
}
