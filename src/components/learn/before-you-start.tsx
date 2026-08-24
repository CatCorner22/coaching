import { BEFORE_YOU_START, BEFORE_YOU_START_GUIDED } from "@/lib/learn/plain-language";
import { cn } from "@/lib/utils";

/**
 * `propOnly` is the default because most lessons here are drills on an
 * unoccupied object. A tie taught in full passes `propOnly={false}` so this
 * card stops telling its reader the opposite of what its own steps say.
 */
export function BeforeYouStart({
  className,
  propOnly = true,
}: {
  className?: string;
  propOnly?: boolean;
}) {
  const items = propOnly ? BEFORE_YOU_START : BEFORE_YOU_START_GUIDED;
  return (
    <aside
      className={cn("rounded-xl border border-border bg-surface p-4 sm:p-5", className)}
      aria-labelledby="before-start-heading"
    >
      <h2 id="before-start-heading" className="text-base font-medium text-fg">
        Before you start
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-base leading-relaxed text-muted">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}
