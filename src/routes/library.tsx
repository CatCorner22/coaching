import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MiniTie } from "@/components/rope-figure";
import { TIES, type Level } from "@/lib/kb";

export const Route = createFileRoute("/library")({ component: LibraryPage });

const LEVELS: Level[] = ["foundation", "building", "advanced"];

function LibraryPage() {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<Level | "all">("all");
  const list = useMemo(() => {
    const terms = q.toLowerCase().trim();
    return TIES.filter((t) => {
      if (level !== "all" && t.level !== level) return false;
      if (!terms) return true;
      const hay = `${t.name} ${t.summary} ${t.intent.join(" ")} ${t.position}`.toLowerCase();
      return hay.includes(terms);
    });
  }, [q, level]);
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Ties</p>
      <h1 className="mt-2 font-display text-4xl">Library</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Unoccupied handling drills are separated from instructor-only restraint categories. A
        library entry is education, never a construction clearance or safe-use approval.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Frog, mermaid, radial, bench…"
          aria-label="Filter ties"
          className="h-11 min-w-48 flex-1 rounded-md border border-border bg-elevated px-3 text-sm"
        />
        {(["all", ...LEVELS] as const).map((lv) => (
          <button
            key={lv}
            type="button"
            onClick={() => setLevel(lv)}
            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide ${
              level === lv ? "border-accent text-fg" : "border-border text-muted"
            }`}
          >
            {lv}
          </button>
        ))}
      </div>
      {LEVELS.filter((lv) => level === "all" || level === lv).map((lv) => {
        const group = list.filter((t) => t.level === lv);
        if (!group.length) return null;
        return (
          <section key={lv} className="mt-10">
            <h2 className="font-display text-2xl capitalize">{lv}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {group.map((t) => (
                <Link
                  key={t.slug}
                  to="/tie/$slug"
                  params={{ slug: t.slug }}
                  className="flex gap-4 rounded-lg border border-border bg-surface p-3 hover:border-border-strong"
                >
                  <MiniTie
                    wraps={t.steps.at(-1)?.wraps ?? []}
                    pose={t.steps.at(-1)?.expected.pose}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-2xl leading-none">{t.name}</span>
                      <Badge>
                        {t.minutes[1] === 0 ? "Instructor route" : `${t.minutes[0]}–${t.minutes[1]}m study`}
                      </Badge>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm text-muted">{t.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
      {list.length === 0 && <p className="mt-10 text-sm text-muted">No ties match that filter.</p>}
    </div>
  );
}
