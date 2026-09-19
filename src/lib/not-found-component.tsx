import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

/**
 * Shown for any URL the app does not have a route for.
 *
 * The router's built-in fallback is a bare "Not Found" string on an unstyled
 * white page, which in a dim room reads as the app having broken.
 */
export function AppNotFoundComponent() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg">
      <span className="text-muted" aria-hidden="true">
        <Compass className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">That page is not here</h1>
      <p className="max-w-md text-sm text-muted">
        The link may be old or mistyped. Nothing about your session, negotiated limits, or journal
        has changed.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3 text-sm">
        <Link to="/" className="underline underline-offset-4">
          Home
        </Link>
        <Link to="/studio" className="underline underline-offset-4">
          Studio
        </Link>
        <Link to="/emergency" className="underline underline-offset-4">
          Emergency card
        </Link>
      </div>
    </section>
  );
}
