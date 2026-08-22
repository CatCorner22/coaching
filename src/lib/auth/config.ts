export type AuthEnvironment = Record<string, string | undefined>;

export class AuthConfigurationError extends Error {
  readonly code = "AUTH_CONFIGURATION_INVALID";
  readonly problems: readonly string[];

  constructor(problems: readonly string[]) {
    super(`Production authentication is misconfigured: ${problems.join("; ")}`);
    this.name = "AuthConfigurationError";
    this.problems = problems;
  }
}

const value = (source: AuthEnvironment, key: string): string | undefined => {
  const candidate = source[key]?.trim();
  return candidate || undefined;
};

export function normalizeHttpsOrigin(candidate: string): string | null {
  const value = candidate.trim().replace(/\/+$/u, "");
  try {
    const parsed = new URL(value);
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.origin !== value ||
      parsed.pathname !== "/" ||
      parsed.search ||
      parsed.hash
    ) {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

/**
 * Validate only the production, auth-enabled contract. Development keeps the
 * bounded preview credentials and process-stable ephemeral signing secret.
 */
export function productionAuthProblems(
  source: AuthEnvironment,
  nodeEnv = source.NODE_ENV,
): string[] {
  if (nodeEnv !== "production" || value(source, "VITE_AUTH_ENABLED") === "false") return [];

  const problems: string[] = [];
  const databaseUrl = value(source, "DATABASE_URL");
  const baseUrl = value(source, "BETTER_AUTH_URL");
  const signingSecret = value(source, "BETTER_AUTH_SECRET");
  const projectId = value(source, "GROK_PROJECT_ID");
  const clientId = value(source, "GROK_AUTH_CLIENT_ID");
  const clientSecret = value(source, "GROK_AUTH_CLIENT_SECRET");
  const authIssuer = value(source, "GROK_AUTH_ISSUER");
  const gateOrigin = value(source, "GROK_GATE_ORIGIN");

  if (!databaseUrl) problems.push("DATABASE_URL is required");
  if (!baseUrl) {
    problems.push("BETTER_AUTH_URL is required");
  } else {
    try {
      const parsed = new URL(baseUrl);
      if (parsed.protocol !== "https:" || parsed.origin !== baseUrl.replace(/\/+$/, "")) {
        problems.push("BETTER_AUTH_URL must be an HTTPS origin without a path");
      }
    } catch {
      problems.push("BETTER_AUTH_URL must be a valid HTTPS origin");
    }
  }
  if (!signingSecret || signingSecret.length < 32) {
    problems.push("BETTER_AUTH_SECRET must contain at least 32 characters");
  }
  if (authIssuer && !normalizeHttpsOrigin(authIssuer)) {
    problems.push("GROK_AUTH_ISSUER must be an HTTPS origin without credentials or a path");
  }
  if (gateOrigin && !normalizeHttpsOrigin(gateOrigin)) {
    problems.push("GROK_GATE_ORIGIN must be an HTTPS origin without credentials or a path");
  }

  if (Boolean(clientId) !== Boolean(clientSecret)) {
    problems.push("GROK_AUTH_CLIENT_ID and GROK_AUTH_CLIENT_SECRET must be configured together");
  }
  if (!projectId && !(clientId && clientSecret)) {
    problems.push(
      "GROK_PROJECT_ID or an explicit GROK_AUTH_CLIENT_ID/GROK_AUTH_CLIENT_SECRET pair is required",
    );
  }
  return problems;
}

export function assertProductionAuthEnvironment(
  source: AuthEnvironment,
  nodeEnv = source.NODE_ENV,
): void {
  const problems = productionAuthProblems(source, nodeEnv);
  if (problems.length) throw new AuthConfigurationError(problems);
}
