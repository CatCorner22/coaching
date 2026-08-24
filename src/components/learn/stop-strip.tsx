import { AlertTriangle } from "lucide-react";
import { toBullets } from "@/lib/learn/plain-language";

type StopStripProps = {
  items: string[];
  className?: string;
};

export function StopStrip({ items, className }: StopStripProps) {
  if (!items.length) return null;
  const lines = items.flatMap((item) => toBullets(item));
  return (
    <section className={className} aria-labelledby="stop-heading">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-5 text-danger-text" aria-hidden />
        <h3 id="stop-heading" className="font-display text-xl text-danger-text">
          Stop if
        </h3>
      </div>
      <p className="mt-2 text-base text-muted">Pause and undo if any of these happen:</p>
      <ul className="mt-3 space-y-3">
        {lines.map((item) => (
          <li key={item} className="flex gap-3 text-base leading-relaxed text-danger-text">
            <span className="mt-2 size-2 shrink-0 rounded-full bg-danger" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
