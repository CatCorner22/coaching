/**
 * Vite replaces this sentinel at compile time. It is true only for `vite dev`;
 * production builds and `vite preview` bake in false. Outside Vite, `typeof`
 * keeps the conservative false default without reading mutable runtime env.
 */
declare const __KNOTTY_DEV_SERVER__: boolean;

export const viteDevServer =
  typeof __KNOTTY_DEV_SERVER__ !== "undefined" &&
  __KNOTTY_DEV_SERVER__ === true;

export type RuntimeDbSource = "neon" | "pglite" | "unconfigured";

export function normalizedDatabaseUrl(raw: string | undefined): string | undefined {
  const value = raw?.trim();
  return value || undefined;
}

/** Pure policy function kept separate so every deployment-mode case is tested. */
export function selectDatabaseSource(
  rawDatabaseUrl: string | undefined,
  developmentServer: boolean,
): RuntimeDbSource {
  if (normalizedDatabaseUrl(rawDatabaseUrl)) return "neon";
  return developmentServer ? "pglite" : "unconfigured";
}
