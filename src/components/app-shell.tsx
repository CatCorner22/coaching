import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Camera, House, Library, Shield } from "lucide-react";
import { ConsentGate } from "@/components/consent-gate";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Atelier", jp: "工房", icon: House },
  { to: "/library", label: "Library", jp: "縄", icon: BookOpen },
  { to: "/studio", label: "Studio", jp: "写", icon: Camera },
  { to: "/knowledge", label: "Knowledge", jp: "知", icon: Library },
  { to: "/safety", label: "Safety", jp: "安", icon: Shield },
] as const;

const MORE = [
  { to: "/knots", label: "Knots" },
  { to: "/plan", label: "Plan" },
  { to: "/journal", label: "Journal" },
  { to: "/gear", label: "Gear" },
  { to: "/dungeon", label: "Dungeon" },
  { to: "/negotiate", label: "Negotiate" },
  { to: "/nerves", label: "Nerves" },
  { to: "/aftercare", label: "Aftercare" },
  { to: "/calc", label: "Rope calc" },
  { to: "/emergency", label: "Cut down" },
  { to: "/settings", label: "Settings" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <ConsentGate>
      <div className="min-h-dvh bg-bg text-fg">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border bg-surface/80 px-4 py-6 md:flex">
          <Link to="/" className="px-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Musubi</p>
            <p className="font-display text-3xl leading-none">結</p>
          </Link>
          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-150",
                  pathname === item.to
                    ? "bg-elevated text-fg"
                    : "text-muted hover:bg-elevated/60 hover:text-fg",
                )}
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
                <span className="ml-auto text-[11px] text-subtle">{item.jp}</span>
              </Link>
            ))}
            <p className="mt-6 px-3 text-[10px] uppercase tracking-[0.2em] text-subtle">More</p>
            {MORE.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-md px-3 py-2 text-sm",
                  pathname === item.to ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="px-3 text-[11px] leading-relaxed text-subtle">
            Private. Local journal. Shears before rope.
          </p>
        </aside>
        <div className="md:pl-56">
          <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
            <Link to="/" className="font-display text-2xl leading-none">
              Musubi
            </Link>
            <Link to="/studio" className="text-xs uppercase tracking-[0.18em] text-muted">
              Studio
            </Link>
          </header>
          <main className="pb-24 md:pb-10">{children}</main>
        </div>
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface/95 px-1 py-1 backdrop-blur md:hidden">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md text-[10px]",
                  active ? "text-fg" : "text-muted",
                )}
              >
                <item.icon className={cn("size-5", item.to === "/studio" && "size-6")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </ConsentGate>
  );
}
