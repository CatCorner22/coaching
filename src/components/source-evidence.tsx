import { Link } from "@tanstack/react-router";
import { getSafetySource, safetySourceAnchor } from "@/lib/kb/sources";
import type { SourceId } from "@/lib/observation/report";

export function SourceEvidence({ sourceIds }: { sourceIds: readonly SourceId[] }) {
  const sources = [...new Set(sourceIds)]
    .map((sourceId) => getSafetySource(sourceId))
    .filter((source) => source !== undefined);
  if (sources.length === 0) return null;

  return (
    <details className="rounded-md border border-border bg-surface px-3 py-2">
      <summary className="cursor-pointer text-xs font-medium text-fg">
        Evidence sources ({sources.length})
      </summary>
      <ul className="mt-2 space-y-2">
        {sources.map((source) => (
          <li key={source.id} className="text-xs leading-relaxed text-muted">
            <a
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="text-fg underline"
            >
              {source.id} · {source.title}
            </a>{" "}
            {/* Client-side navigation: a raw href reloads the document, which
                discards the page-memory capture and the one-use observation
                report this panel is attached to. */}
            <Link
              to="/safety"
              hash={safetySourceAnchor(source.id)}
              className="text-subtle underline"
            >
              Ledger
            </Link>
            <span className="mt-0.5 block">{source.note}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
