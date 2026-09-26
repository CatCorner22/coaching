import { isTrustedAppOrigin, isTrustedDevelopmentOrigin } from "./origin";

type HeaderSource = {
  get(name: string): string | null;
};

export type AvailabilityOriginEnv = {
  configuredOrigin?: string | null;
  devHost?: string | null;
  viteDevServer: boolean;
  allowPreviewHosts?: boolean;
};

export function availabilityOriginDecision(
  headers: HeaderSource | null | undefined,
  env: AvailabilityOriginEnv,
): "ok" | "origin_not_trusted" {
  const origin = headers?.get("origin");
  if (!origin) {
    const fetchSite = headers?.get("sec-fetch-site")?.toLowerCase();
    return fetchSite === "same-origin" || fetchSite === "none" ? "ok" : "origin_not_trusted";
  }
  if (
    !isTrustedAppOrigin(origin, {
      configuredOrigin: env.configuredOrigin,
      allowLoopback: env.viteDevServer,
      devHost: env.devHost,
      allowPreviewHosts: env.allowPreviewHosts,
    })
  ) {
    return "origin_not_trusted";
  }
  if (env.viteDevServer && !isTrustedDevelopmentOrigin(origin, env.configuredOrigin)) {
    return "origin_not_trusted";
  }
  return "ok";
}
