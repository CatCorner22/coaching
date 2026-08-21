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

  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site") throw new AiRequestDeniedError("Cross-site AI requests are not allowed");

  const origin = request.headers.get("origin");
  if (!origin && process.env.NODE_ENV === "production") {
    throw new AiRequestDeniedError("AI requests require a same-origin browser request");
  }
  if (origin) {
    let expected: string;
    try {
      expected = new URL(request.url).origin;
    } catch {
      throw new AiRequestDeniedError("Request origin is invalid");
    }
    if (origin !== expected) throw new AiRequestDeniedError("Request origin is not allowed");
  }
  return { userId, signal: request.signal };
}
