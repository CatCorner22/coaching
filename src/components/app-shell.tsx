import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ConsentGate } from "@/components/consent-gate";
import { subscribeToLocalDataErase } from "@/lib/privacy/local-data";
import { authEnabled } from "@/lib/auth/client";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { isActive, MORE, NAV, routeTitle } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [moreOpen, setMoreOpen] = useState(false);
  useEffect(
    () => subscribeToLocalDataErase(() => window.location.reload()),
    [],
  );
  // Never leave the sheet covering the screen after a navigation.
  useEffect(() => setMoreOpen(false), [pathname]);
  const mainRef = useRef<HTMLElement>(null);
  const firstRenderRef = useRef(true);
  useEffect(() => {
    document.title = routeTitle(pathname);
    // Move focus to the new page's content on client navigation so keyboard and
    // screen-reader users are not left where the old page's link used to be.
    // Skipped on first paint so a deep link does not steal focus.
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [pathname]);
  if (pathname === "/emergency") {
    return <div className="min-h-dvh bg-bg text-fg">{children}</div>;
  }
  return (
    <ConsentGate>
      <div className="min-h-dvh bg-bg text-fg">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-fg"
        >
          Skip to content
        </a>
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border bg-surface/80 px-4 py-6 md:flex">
          <Link to="/" className="px-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Rope studio</p>
            <p className="font-display text-3xl leading-none">Knotty</p>
          </Link>
          <nav aria-label="Main" className="mt-8 flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const active = isActive(pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-150",
                    active
                      ? "bg-elevated text-fg"
                      : "text-muted hover:bg-elevated/60 hover:text-fg",
                  )}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <p className="mt-6 px-3 text-[10px] uppercase tracking-[0.2em] text-subtle">More</p>
            {MORE.map((item) => {
              const active = isActive(pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm",
                    active ? "text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {authEnabled && (
            <div className="mb-4 border-t border-border px-3 pt-4">
              <SignedOut>
                <Link to="/login" className="text-sm text-muted underline-offset-4 hover:underline">
                  Sign in for cloud analysis
                </Link>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          )}
          <p className="px-3 text-[11px] leading-relaxed text-subtle">
            Local notes are unencrypted. Analyze uses cloud services. Shears before rope.
          </p>
        </aside>
        <div className="md:pl-56">
          <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
            <Link to="/" className="font-display text-2xl leading-none">
              Knotty
            </Link>
            <div className="flex items-center gap-3">
              {authEnabled && (
                <>
                  <SignedOut>
                    <Link to="/login" className="text-xs uppercase tracking-[0.18em] text-muted">
                      Sign in
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <UserButton compact />
                  </SignedIn>
                </>
              )}
              <Link to="/studio" className="text-xs uppercase tracking-[0.18em] text-muted">
                Studio
              </Link>
            </div>
          </header>
          <main
            id="main"
            ref={mainRef}
            tabIndex={-1}
            aria-label={routeTitle(pathname)}
            className="pb-24 outline-none md:pb-10"
          >
            {children}
          </main>
        </div>
        {/* Without this sheet the 13 "More" destinations — including Emergency,
            Check-in, Negotiate and Settings — exist only in the desktop
            sidebar and are unreachable on a phone. */}
        {moreOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
        )}
        <div
          id="more-sheet"
          hidden={!moreOpen}
          className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-40 max-h-[60vh] overflow-y-auto border-t border-border bg-surface px-3 py-3 md:hidden"
        >
          <nav aria-label="More destinations" className="grid grid-cols-2 gap-1">
            {MORE.map((item) => {
              const active = isActive(pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center rounded-md px-3 text-sm",
                    active ? "bg-elevated text-fg" : "text-muted",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <nav
          aria-label="Primary"
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-border bg-surface/95 px-1 py-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        >
          {NAV.map((item) => {
            const active = isActive(pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
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
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            aria-expanded={moreOpen}
            aria-controls="more-sheet"
            className={cn(
              "flex min-h-12 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md text-[10px]",
              moreOpen ? "text-fg" : "text-muted",
            )}
          >
            <Menu className="size-5" />
            More
          </button>
        </nav>
      </div>
    </ConsentGate>
  );
}
