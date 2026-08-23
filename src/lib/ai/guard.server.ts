import { getRequest } from "@tanstack/react-start/server";
import { isTrustedAppOrigin } from "./origin";
import { DEV_USER_ID, UnauthorizedError, requireUserId } from "@/lib/auth/verify.server";
import { viteDevServer } from "@/lib/runtime-mode";

export class AiRequestDeniedError extends Error {
  readonly status = 403;
  readonly code = "AI_REQUEST_FORBIDDEN";

  constructor(message: string) {
    super(message);
    this.name = "AiRequestDeniedError";
  }
}

function trustedDevelopmentHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".grok-sandbox.com")
  );
}

/** Authenticate cost-bearing endpoints and reject cross-site browser calls. */
export async function authorizeAiRequest(verifiedUserId?: string): Promise<{ userId: string; signal: AbortSignal }> {
  // The standard auth middleware supplies this value after resolving either
  // the same-origin session cookie or the live-preview bearer token. Retain the
  // direct resolver only for server-only callers that do not use middleware.
  const userId = verifiedUserId?.trim() || await requireUserId();
  if (userId === DEV_USER_ID && !viteDevServer) {
    throw new UnauthorizedError();
  }
  const request = getRequest();
  if (!request) throw new Error("Request context is unavailable");

  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site") throw new AiRequestDeniedError("Cross-site AI requests are not allowed");

  const origin = request.headers.get("origin");
  if (!origin) {
    throw new AiRequestDeniedError("AI requests require a same-origin browser request");
  }
  if (
    !isTrustedAppOrigin(origin, {
      configuredOrigin: process.env.BETTER_AUTH_URL,
      allowLoopback: viteDevServer,
    })
  ) {
    throw new AiRequestDeniedError("Request origin is not allowed");
  }

  if (userId === DEV_USER_ID) {
    if (process.env.ALLOW_DEV_AI?.trim().toLowerCase() !== "true") {
      throw new AiRequestDeniedError("Development AI is disabled");
    }
    // Judged on the Origin the browser sent, which the checks above have already
    // matched against configuration, rather than on the request's own Host.
    if (!trustedDevelopmentHost(new URL(origin).hostname)) {
      throw new AiRequestDeniedError("Development AI is limited to loopback and trusted preview hosts");
    }
  }
  return { userId, signal: request.signal };
}
