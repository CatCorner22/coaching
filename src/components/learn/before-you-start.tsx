import { BEFORE_YOU_START } from "@/lib/learn/plain-language";
import { cn } from "@/lib/utils";

export function BeforeYouStart({ className }: { className?: string }) {
  return (
    <aside
      className={cn("rounded-xl border border-border bg-surface p-4 sm:p-5", className)}
      aria-labelledby="before-start-heading"
    >
      <h2 id="before-start-heading" className="text-base font-medium text-fg">
        Before you start
      </h2>
      <ul className="mt-3 space-y-2">
        {BEFORE_YOU_START.map((item) => (
          <li key={item} className="flex gap-2.5 text-base leading-relaxed text-muted">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}
