import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  // Use the app's always-dark tokens, not a prefers-color-scheme palette: the
  // zinc/dark: pairing rendered a full-bleed white page for anyone whose OS is
  // in light mode, which is exactly the wrong surprise in a dim room.
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg">
      <span className="text-danger-text" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm break-words text-muted">
        {error.message || "An unexpected error occurred. Try reloading the page."}
      </p>
    </main>
  );
}
