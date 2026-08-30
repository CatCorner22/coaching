import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { AppNotFoundComponent } from "@/lib/not-found-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: AppNotFoundComponent,
    // Fetch chunks for on-screen links while the network is still up. Without
    // this, tapping a not-yet-loaded route after a redeploy (old hashed
    // chunks 404) or offline made the lazy route silently
    // window.location.reload() — wiping the tab-memory check-in and capture
    // state the README promises stays in the tab — and the second offline
    // episode dead-ended because the reload guard key persists for the tab.
    defaultPreload: "viewport",
  });
}
