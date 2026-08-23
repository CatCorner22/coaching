import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Shorter than a deliberate second press, longer than a double-tap. */
export const MIN_CONFIRM_DWELL_MS = 400;

/**
 * A destructive action that takes two presses. Journal entries and similar
 * records cannot be regenerated, and the original controls were tiny unpadded
 * text buttons with no confirmation and no undo.
 *
 * The armed state reverts on a timeout so a stray first press does not leave a
 * live "delete" waiting under the reader's thumb.
 */
export function DeleteButton({
  label,
  onConfirm,
  idleText = "Delete",
  confirmText = "Confirm delete",
  className,
}: {
  label: string;
  onConfirm: () => void;
  idleText?: string;
  confirmText?: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // A double-click or double-tap would otherwise satisfy both presses at once,
  // which is exactly the accidental input this guard exists to stop — and the
  // records it protects cannot be regenerated. The confirm press is ignored
  // until the armed state has been visible long enough to read.
  const armedAt = useRef(0);
  useEffect(() => {
    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, []);
  return (
    <button
      type="button"
      aria-label={armed ? `${label} — press again to confirm` : label}
      className={cn(
        "min-h-11 cursor-pointer rounded-md px-3 text-xs",
        armed ? "bg-danger/15 text-danger-text" : "text-muted hover:text-fg",
        className,
      )}
      onClick={() => {
        if (timer.current !== null) clearTimeout(timer.current);
        if (!armed) {
          setArmed(true);
          armedAt.current = Date.now();
          timer.current = setTimeout(() => setArmed(false), 5000);
          return;
        }
        if (Date.now() - armedAt.current < MIN_CONFIRM_DWELL_MS) {
          // Keep it armed and let the 5s window continue; do not delete.
          timer.current = setTimeout(() => setArmed(false), 5000);
          return;
        }
        setArmed(false);
        onConfirm();
      }}
    >
      {armed ? confirmText : idleText}
    </button>
  );
}
