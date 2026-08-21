import { getRequest } from "@tanstack/react-start/server";
import { DEV_USER_ID, UnauthorizedError, requireUserId } from "@/lib/auth/verify.server";

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
  if (userId === DEV_USER_ID && process.env.NODE_ENV === "production") {
    throw new UnauthorizedError();
  }
  const request = getRequest();
  if (!request) throw new Error("Request context is unavailable");

  let requestUrl: URL;
  try {
    requestUrl = new URL(request.url);
  } catch {
    throw new AiRequestDeniedError("Request URL is invalid");
  }
  if (userId === DEV_USER_ID) {
    if (process.env.ALLOW_DEV_AI?.trim().toLowerCase() !== "true") {
      throw new AiRequestDeniedError("Development AI is disabled");
    }
    if (!trustedDevelopmentHost(requestUrl.hostname)) {
      throw new AiRequestDeniedError("Development AI is limited to loopback and trusted preview hosts");
    }
  }

  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site") throw new AiRequestDeniedError("Cross-site AI requests are not allowed");

  const origin = request.headers.get("origin");
  if (!origin) {
    throw new AiRequestDeniedError("AI requests require a same-origin browser request");
  }
  if (origin) {
    if (origin !== requestUrl.origin) throw new AiRequestDeniedError("Request origin is not allowed");
  }
  return { userId, signal: request.signal };
}
