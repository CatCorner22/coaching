import { createServerFn } from "@tanstack/react-start";

export type AuthCapabilities = {
  gateIdentity: boolean;
  oauthProviders: boolean;
};

export const AUTH_CAPABILITIES_TIMEOUT_MS = 5_000;

/** Server-owned auth capability discovery; never infer secret-backed providers in the browser. */
export const getAuthCapabilities = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthCapabilities> => {
    const [{ gateIdentityEnabled }, { authConfigured }] = await Promise.all([
      import("./gate-identity.server"),
      import("./server"),
    ]);
    return {
      gateIdentity: gateIdentityEnabled(),
      oauthProviders: authConfigured,
    };
  },
);

/** Bound capability discovery so auth UI always reaches a retry/safe-local state. */
export async function getAuthCapabilitiesBounded(): Promise<AuthCapabilities> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      getAuthCapabilities(),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error("Sign-in capability check timed out.")),
          AUTH_CAPABILITIES_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
