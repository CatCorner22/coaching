import { Camera, CheckCircle2, Eye, Hand, Volume2 } from "lucide-react";
import { LESSON_FORMAT } from "@/lib/learn/plain-language";

export function HowToLearn() {
  return (
    <section
      className="rounded-xl border border-accent/25 bg-accent/5 p-5 sm:p-6"
      aria-labelledby="how-to-learn-heading"
    >
      <h2 id="how-to-learn-heading" className="font-display text-2xl">
        How these lessons work
      </h2>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
        Every lesson uses the same three parts. You never have to guess what comes next. Turn on{" "}
        <strong className="font-medium text-fg">auto-read</strong> to hear each step spoken aloud, or use the practice
        cam for probabilistic hints — never safety clearance.
      </p>
      <ol className="mt-5 grid gap-3 sm:grid-cols-3">
        {LESSON_FORMAT.map((part, i) => (
          <li
            key={part.num}
            className="rounded-lg border border-border bg-surface px-4 py-4"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-fg">
                {part.num}
              </span>
              {i === 0 && <Hand className="size-4 text-accent" aria-hidden />}
              {i === 1 && <Eye className="size-4 text-ok" aria-hidden />}
              {i === 2 && <Volume2 className="size-4 text-muted" aria-hidden />}
              <p className="text-base font-medium text-fg">{part.label}</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{part.hint}</p>
          </li>
        ))}
      </ol>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        <li className="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3">
          <Volume2 className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="text-base font-medium text-fg">Listen</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Auto-read walks through do, check, and say in a warm female coach voice. Tap &ldquo;Read full step aloud&rdquo; any time.
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3">
          <Camera className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="text-base font-medium text-fg">Practice cam</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Frame your empty prop and rope. Snap a photo or record a 3s loop for heuristic hints — compare to the
              diagram yourself.
            </p>
          </div>
        </li>
      </ul>
      <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-muted">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden />
        <span>
          <strong className="font-medium text-fg">Tip:</strong> Check the boxes on each step before you press Next.
          That helps you not skip the important look-and-check part.
        </span>
      </p>
    </section>
  );
}
