import { AlertTriangle } from "lucide-react";

type StopStripProps = {
  items: string[];
  className?: string;
};

export function StopStrip({ items, className }: StopStripProps) {
  if (!items.length) return null;
  return (
    <section className={className} aria-labelledby="stop-heading">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 text-danger" aria-hidden />
        <h3 id="stop-heading" className="font-display text-xl text-danger">
          Stop if
        </h3>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-relaxed text-danger/90">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
