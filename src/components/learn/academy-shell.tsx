import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type AcademyShellProps = {
  backTo: string;
  backLabel: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  goal?: string;
  badges?: React.ReactNode;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function AcademyShell({
  backTo,
  backLabel,
  eyebrow,
  title,
  subtitle,
  goal,
  badges,
  children,
  sidebar,
  footer,
  className,
}: AcademyShellProps) {
  return (
    <div className={cn("academy-shell mx-auto max-w-6xl px-5 py-8 sm:py-10", className)}>
      <Link
        to={backTo}
        className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-fg"
      >
        <ChevronLeft className="size-3.5" aria-hidden />
        {backLabel}
      </Link>

      <header className="mt-4 border-b border-border pb-6">
        {eyebrow && <p className="text-xs uppercase tracking-[0.22em] text-muted">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-4xl leading-none sm:text-5xl">{title}</h1>
        {badges && <div className="mt-3 flex flex-wrap gap-2">{badges}</div>}
        {subtitle && <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{subtitle}</p>}
        {goal && (
          <p className="academy-goal mt-4 max-w-2xl rounded-lg border border-accent/20 bg-accent/5 px-4 py-4 text-base leading-relaxed text-fg">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-accent">
              Your goal — one sentence
            </span>
            {goal}
          </p>
        )}
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(280px,100%)]">
        <div className="min-w-0 space-y-6">{children}</div>
        {sidebar && <aside className="h-fit lg:sticky lg:top-6">{sidebar}</aside>}
      </div>

      {footer && <footer className="mt-10 border-t border-border pt-8">{footer}</footer>}
    </div>
  );
}
