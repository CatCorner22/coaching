import { createFileRoute, Link } from "@tanstack/react-router";
import { CONVERSATION_GUIDE } from "@/lib/boundaries/conversation";

export const Route = createFileRoute("/conversation")({ component: ConversationPage });

function ConversationPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Talk first</p>
      <h1 className="mt-2 font-display text-4xl">Conversation guide</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Questions to ask each other before, during and after. Read them aloud, take turns, skip any.
      </p>
      <nav aria-label="Sections" className="mt-6 flex flex-wrap gap-2">
        {CONVERSATION_GUIDE.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="min-h-11 rounded-full border border-border px-3 py-2 text-sm text-muted hover:text-fg">
            {s.title}
          </a>
        ))}
      </nav>
      <div className="mt-8 space-y-8">
        {CONVERSATION_GUIDE.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-20 rounded-lg border border-border bg-surface p-5">
            <h2 className="font-display text-2xl">{s.title}</h2>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted">{s.when}</p>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-base leading-relaxed">
              {s.prompts.map((p) => <li key={p}>{p}</li>)}
            </ol>
            {s.tip && <p className="mt-4 rounded-md bg-accent/5 p-3 text-sm text-muted">{s.tip}</p>}
          </section>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link to="/boundaries" className="underline">Boundaries checklist</Link>
        <Link to="/aftercare" className="underline">Aftercare</Link>
        <Link to="/journal" className="underline">Journal</Link>
      </div>
    </div>
  );
}
