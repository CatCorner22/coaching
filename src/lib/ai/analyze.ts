import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getTie } from "@/lib/kb";
import { mediaUploadScope } from "@/lib/media-scope";
import { MAX_HARD_NO_LENGTH, MAX_HARD_NOS } from "@/lib/negotiation-bounds";
import { authMiddleware } from "@/lib/auth/middleware";
import { fuseCoach } from "@/lib/ml/fuse";
import { clampStep, isCameraDataUrl, sanitizeDet, sanitizeQuestion } from "@/lib/ml/sanitize";
import type { DeterministicReport, SafetyFlag } from "@/lib/ml/types";
import {
  admitRemoteCategories,
  buildObservationReport,
  CANONICAL_IDS,
  type ModelCategoryMatch,
  type ModelStatus,
  type TriageState,
} from "@/lib/observation/report";
import { UnauthorizedError } from "@/lib/auth/verify.server";
import { PRE_DISPATCH_MARKER } from "./analyze-errors";
import { AiRequestDeniedError, authorizeAiRequest } from "./guard.server";
import { buildSystemPrompt, verifyBatchConsentScope } from "./analyze-consent";
import { grokChat, grokProviderConfigured, parseStrictJson } from "./grok";
import { MediaBatchReplayError, MediaBatchReservationError } from "./media-replay-core";
import { RateLimitError } from "./rate-limit-core";
import type { AnalyzeInput, AnalyzeResult, ProviderFailure } from "./schema";

type AnalyzeHandlerInput = {
  images: string[];
  frameLabels: string[];
  hardNos: string[];
  deterministic: DeterministicReport;
  stepIndex: number;
  elapsedSec: number;
  tieSlug: string | undefined;
  triage: (typeof triageValues)[number];
  media: AnalyzeInput["media"];
  consent: AnalyzeInput["consent"];
};

const triageValues = [
  "none",
  "prompt_medical",
  "emergency",
  "coercion_or_secret_recording",
] as const;
const modelResponseSchema = z
  .object({
    matches: z
      .array(
        z
          .object({
            frame_id: z.string().regex(/^F[0-9]{2}$/),
            canonical_id: z.enum(CANONICAL_IDS),
          })
          .strict(),
      )
      .max(12),
    audit: z
      .object({
        nonvisual_inference: z.boolean(),
        exact_identification: z.boolean(),
        procedural_content: z.boolean(),
        note: z.string().max(240),
      })
      .strict(),
  })
  .strict();

const MODEL_RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "knotty_visible_categories",
    strict: true,
    schema: {
      type: "object",
      properties: {
        matches: {
          type: "array",
          maxItems: 12,
          items: {
            type: "object",
            properties: {
              frame_id: { type: "string", pattern: "^F[0-9]{2}$" },
              canonical_id: { type: "string", enum: CANONICAL_IDS },
            },
            required: ["frame_id", "canonical_id"],
            additionalProperties: false,
          },
        },
        audit: {
          type: "object",
          properties: {
            nonvisual_inference: { type: "boolean" },
            exact_identification: { type: "boolean" },
            procedural_content: { type: "boolean" },
            note: { type: "string", maxLength: 240 },
          },
          required: ["nonvisual_inference", "exact_identification", "procedural_content", "note"],
          additionalProperties: false,
        },
      },
      required: ["matches", "audit"],
      additionalProperties: false,
    },
  },
} as const;

const analyzeInputSchema = z
  .object({
    images: z.array(z.string().min(32).max(900_000)).min(1).max(3),
    frameLabels: z
      .array(z.string().regex(/^[FSV][0-9]{2}$/))
      .max(3)
      .optional(),
    deterministic: z
      .object({
        wrapCount: z.number().finite().min(0).max(40),
        wrapBands: z
          .array(z.object({ yNorm: z.number().finite(), strength: z.number().finite() }).strict())
          .max(16),
        neckRope: z.number().finite(),
        paleness: z.number().finite(),
        palenessDelta: z.number().finite(),
        motion: z.number().finite(),
        flags: z
          .array(
            z
              .object({
                code: z.enum([
                  "neck",
                  "circulation",
                  "time",
                  "radial",
                  "peroneal",
                  "breathing",
                  "unknown",
                ]),
                severity: z.enum(["info", "watch", "stop"]),
                note: z.string().max(240),
              })
              .strict(),
          )
          .max(12),
        recommend: z.enum(["continue", "adjust", "stop"]),
        notes: z.array(z.string().max(200)).max(8),
      })
      .strict(),
    tieSlug: z.string().max(60).optional(),
    stepIndex: z.number().finite().optional(),
    elapsedSec: z.number().finite().optional(),
    hardNos: z.array(z.string().max(MAX_HARD_NO_LENGTH)).max(MAX_HARD_NOS).optional(),
    triage: z.enum(triageValues),
    media: z
      .object({
        mode: z.enum(["static_photos", "selected_video_stills"]),
        quality: z
          .object({
            sharpness: z.number().finite().min(0).max(1),
            exposure: z.number().finite().min(0).max(1),
            score: z.number().finite().min(0).max(1),
          })
          .strict(),
      })
      .strict(),
    consent: z
      .object({
        adults: z.literal(true),
        /**
         * The batch is within this deployment's upload scope. What that
         * attestation *says* depends on `scope` below: under `non_explicit`
         * the operator confirmed no nudity; under `adult_nudity` they
         * confirmed adult nudity at most. Sexual activity is out of scope at
         * every setting.
         */
        withinUploadScope: z.literal(true),
        /**
         * Which scope wording the attestation checkbox carried. Verified
         * against the deployment's configured scope in the validator, so the
         * server knows which attestation was actually made instead of
         * receiving one indistinguishable bit under both settings.
         */
        scope: z.enum(["non_explicit", "adult_nudity"]),
        nonSecret: z.literal(true),
        nonCoerced: z.literal(true),
        allPeopleConsented: z.literal(true),
        activity: z.literal(true),
        recording: z.literal(true),
        upload: z.literal(true),
        output: z.literal(true),
        batchId: z.string().uuid(),
        confirmedAt: z.number().finite().int().positive(),
      })
      .strict(),
  })
  .strict();

export const analyzeRope = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    try {
      return validateAnalyzeInput(input);
    } catch (error) {
      // A validator failure is thrown, not returned, so the client only sees
      // an error string and has to assume the one-use batch may already have
      // been reserved. Nothing runs before this, so mark it as provably
      // pre-dispatch and let the client reopen the batch.
      const message = error instanceof Error ? error.message : "Invalid request";
      throw new Error(`${PRE_DISPATCH_MARKER} ${message}`);
    }
  })
  .handler(async ({ data, context }): Promise<AnalyzeResult> => {
    try {
      return await runAnalyzeRequest(data, context);
    } catch (error) {
      // Admission failures used to escape as thrown errors, which the client
      // could only render as raw text and which left the one-use batch closed
      // even though nothing was ever reserved. They are ordinary results.
      if (error instanceof AiRequestDeniedError || error instanceof UnauthorizedError) {
        return {
          ok: false,
          error:
            error instanceof AiRequestDeniedError
              ? `No media was sent to xAI. ${error.message}`
              : "No media was sent to xAI. This deployment did not accept the request (sign-in). Nothing was used from this batch.",
          providerAttempted: false,
          code: "AI_REQUEST_FORBIDDEN",
          status: 403,
          retryableBeforeProvider: true,
        };
      }
      if (error instanceof AnalyzeRequestError) {
        return {
          ok: false,
          error: error.message,
          providerAttempted: false,
          code: "AI_REQUEST_INVALID",
          status: 400,
          retryableBeforeProvider: true,
        };
      }
      throw error;
    }
  });

// Split out of the validator so every throw inside can be tagged as
// happening before any reservation or dispatch.
function validateAnalyzeInput(input: unknown) {
  // A ZodError serializes its whole issue array as the thrown message, and
  // the Studio prints thrown messages verbatim: a single mistyped field used
  // to render as a kilobyte of JSON in the error banner.
  const validated = analyzeInputSchema.safeParse(input);
  if (!validated.success) {
    throw new AnalyzeRequestError(
      "This capture could not be submitted: the request did not match what the server expects. Discard the batch and capture again.",
    );
  }
  const parsed = validated.data;
  for (const image of parsed.images) {
    if (!isCameraDataUrl(image)) throw new Error("Stills must be camera captures, not remote URLs");
  }
  if (parsed.frameLabels && parsed.frameLabels.length !== parsed.images.length) {
    throw new Error("Each selected still needs one frame label");
  }
  const consentAgeMs = Date.now() - parsed.consent.confirmedAt;
  if (consentAgeMs < -5 * 60_000 || consentAgeMs > 60 * 60_000) {
    throw new Error("Media permissions must be reconfirmed for this batch");
  }
  // The attestation must be the one this deployment's scope setting asks
  // for. A stale client built against a different scope — or a widened
  // hand-rolled request — fails closed here rather than being silently
  // reinterpreted.
  verifyBatchConsentScope(parsed.consent.scope);
  const tieSlug = parsed.tieSlug?.slice(0, 60);
  return {
    images: parsed.images.slice(0, 3),
    // Relabel the selected images by bounded batch position. Source clip
    // labels can be sparse and are not a trusted chronology declaration.
    frameLabels: parsed.images.map((_, index) => `F${String(index + 1).padStart(2, "0")}`),
    // The module's contract: the hard-no list is never silently shortened.
    // Both bounds match the schema — the old 80/24 pair was a leftover of a
    // bare-24 cap and dropped entries (and tail text) with nothing to say so.
    hardNos: (parsed.hardNos ?? [])
      .map((value) => sanitizeQuestion(value, MAX_HARD_NO_LENGTH))
      .filter(Boolean)
      .slice(0, MAX_HARD_NOS),
    deterministic: sanitizeDet(parsed.deterministic),
    stepIndex: Number.isFinite(parsed.stepIndex) ? Math.round(parsed.stepIndex as number) : 0,
    elapsedSec: Math.max(0, Math.min(8 * 3600, Number(parsed.elapsedSec) || 0)),
    tieSlug: tieSlug && getTie(tieSlug) ? tieSlug : undefined,
    triage: parsed.triage,
    media: parsed.media,
    consent: parsed.consent,
  };
}

class AnalyzeRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalyzeRequestError";
  }
}

async function runAnalyzeRequest(
  data: AnalyzeHandlerInput,
  context: { userId?: string },
): Promise<AnalyzeResult> {
  {
    // This bounded admission result cannot send media, consume quota, or touch
    // per-user state. authMiddleware has already applied the auth-mode and
    // same-site checks; returning here also lets an auth-off production preview
    // exercise the retry contract without relaxing the configured-provider
    // authorization boundary below.
    if (data.triage === "none" && !grokProviderConfigured()) {
      return {
        ok: false,
        error:
          "No media was sent to xAI. The service is not available in this environment; retry after the deployment is configured.",
        providerAttempted: false,
        code: "AI_PROVIDER_UNAVAILABLE",
        status: 503,
        retryableBeforeProvider: true,
      };
    }
    const authorization = await authorizeAiRequest(context.userId);
    const det = closeClientHeuristic(sanitizeDet(data.deterministic));
    const tie = data.tieSlug ? getTie(data.tieSlug) : undefined;
    const stepIndex = clampStep(data.stepIndex ?? 0, tie?.steps.length ?? 1);
    const elapsedSec = data.elapsedSec ?? 0;
    const hardNos = data.hardNos ?? [];
    const triage = data.triage as TriageState;
    const effectiveDet = triage === "none" ? det : triageStopReport(det, triage);
    let modelStatus: ModelStatus = "not_requested";
    let providerFailure: ProviderFailure | undefined;
    let providerRetryAfterMs: number | undefined;
    let refusal = false;
    let matches: ModelCategoryMatch[] = [];
    let selfAudit = {
      contradictsDet: false,
      hardLimit: false,
      invented: false,
      note:
        triage === "none"
          ? "Remote classification not completed."
          : "Triage bypassed remote classification.",
    };

    if (triage === "none") {
      const { consumeAiBudget } = await import("./rate-limit.server");
      const { consumeMediaBatch, releaseMediaBatch } = await import("./media-replay.server");
      let reservationId: string | null = null;
      try {
        reservationId = await consumeMediaBatch(authorization.userId, data.consent.batchId, () => {
          consumeAiBudget("vision", 8, 10 * 60_000, authorization.userId);
        });
      } catch (error) {
        if (error instanceof RateLimitError) {
          return {
            ok: false,
            error: `No media was sent to xAI. AI request capacity is full; retry this batch in about ${Math.max(1, Math.ceil(error.retryAfterMs / 60_000))} minute(s).`,
            providerAttempted: false,
            code: error.code,
            status: error.status,
            retryableBeforeProvider: true,
            retryAfterMs: error.retryAfterMs,
          };
        }
        if (error instanceof MediaBatchReplayError) {
          return {
            ok: false,
            error:
              "This batch was already submitted or reserved. Discard it and confirm a new batch.",
            providerAttempted: false,
            code: error.code,
            status: error.status,
            retryableBeforeProvider: false,
          };
        }
        if (error instanceof MediaBatchReservationError) {
          // Operator-visible: a missing media_batch_reservation table
          // (db:migrate never ran) or a database outage reads to users as
          // "could not be confirmed" while the function logs stayed empty.
          // Cause class and message only — never media or identifiers.
          console.error(
            "[analyze] batch reservation failed:",
            error.cause instanceof Error
              ? `${error.cause.name}: ${error.cause.message}`
              : error.code,
          );
          return {
            ok: false,
            error:
              "No media was sent to xAI. The one-use batch reservation could not be confirmed; discard this batch rather than retrying it.",
            providerAttempted: false,
            code: error.code,
            status: error.status,
            retryableBeforeProvider: false,
          };
        }
        throw error;
      }
      const content: unknown[] = [];
      data.images.forEach((url, index) => {
        content.push({ type: "text", text: `User-selected still ${data.frameLabels[index]}.` });
        content.push({ type: "image_url", image_url: { url, detail: "high" as const } });
      });

      const grok = await grokChat({
        temperature: 0,
        max_tokens: 700,
        responseFormat: MODEL_RESPONSE_FORMAT,
        signal: authorization.signal,
        messages: [
          { role: "system", content: buildSystemPrompt(mediaUploadScope()) },
          { role: "user", content },
        ],
      });

      if (!grok.ok && grok.providerAttempted === false) {
        let releaseConfirmed = false;
        if (reservationId && grok.retryableBeforeProvider) {
          try {
            await releaseMediaBatch(authorization.userId, data.consent.batchId, reservationId);
            releaseConfirmed = true;
          } catch (error) {
            console.error("[analyze] unable to release preflight reservation", error);
          }
        }
        const releaseError = reservationId && grok.retryableBeforeProvider && !releaseConfirmed;
        return {
          ok: false,
          error: releaseError
            ? "Analysis could not start and the capture could not be reset — take a fresh capture."
            : grok.privacyFailure === "preflight"
              ? "No media was sent to xAI. This batch's non-sensitive zero-data-retention preflight failed, so the one-use batch was closed. Discard it and confirm a new batch after the deployment's xAI team settings are corrected."
              : "No media was sent to xAI. The provider became unavailable after this one-use batch was reserved. Discard it and confirm a new batch after the deployment is corrected.",
          providerAttempted: false,
          code:
            grok.privacyFailure === "preflight"
              ? "AI_PRIVACY_UNAVAILABLE"
              : "AI_PROVIDER_UNAVAILABLE",
          status: 503,
          retryableBeforeProvider: releaseConfirmed,
        };
      }
      if (!grok.ok && grok.transportFailure) {
        return {
          ok: false,
          error:
            grok.transportFailure === "timeout"
              ? "The selected stills were sent but xAI did not answer within 45 seconds, so this one-use batch is closed. Check the connection, then capture and confirm a new batch."
              : grok.transportFailure === "aborted"
                ? "The request was cancelled before xAI answered, so this one-use batch is closed. Capture and confirm a new batch when you are ready."
                : "The connection to xAI dropped before an answer arrived, so this one-use batch is closed. Check the network, then capture and confirm a new batch.",
          providerAttempted: true,
          code: "AI_TRANSPORT_FAILED",
          status: 502,
          retryableBeforeProvider: false,
        };
      }
      if (!grok.ok && grok.privacyFailure === "response") {
        return {
          ok: false,
          error:
            "The media request may have reached xAI, but no response confirmed zero data retention. The response was discarded. Do not retry this batch; correct the deployment's xAI privacy settings, then capture and confirm a new batch.",
          providerAttempted: true,
          code: "AI_PRIVACY_RESPONSE_UNVERIFIED",
          status: 502,
          retryableBeforeProvider: false,
        };
      }
      if (!grok.ok) {
        refusal = grok.refused === true;
        modelStatus =
          grok.error === "AI is not available in this environment"
            ? "unavailable"
            : refusal
              ? "refused"
              : "failed";
        providerFailure = refusal
          ? "refused"
          : modelStatus === "unavailable"
            ? "unavailable"
            : grok.status === 429
              ? "rate_limited"
              : typeof grok.status === "number"
                ? "http_error"
                : grok.error === "xAI returned an incomplete response"
                  ? "incomplete"
                  : "contract";
        providerRetryAfterMs = grok.retryAfterMs;
        selfAudit.note = `Remote classification ${modelStatus}.`;
      } else {
        const candidate = parseStrictJson<unknown>(grok.text);
        const parsed = modelResponseSchema.safeParse(candidate);
        if (!parsed.success) {
          modelStatus = "failed";
          providerFailure = "contract";
          selfAudit.hardLimit = true;
          selfAudit.note = "Remote output failed the closed schema and was discarded.";
        } else {
          const admitted = admitRemoteCategories(
            parsed.data.matches,
            data.frameLabels,
            parsed.data.audit,
          );
          matches = admitted.matches;
          modelStatus = admitted.modelStatus;
          selfAudit = {
            contradictsDet: false,
            hardLimit: admitted.hardLimit,
            invented:
              parsed.data.audit.nonvisual_inference || parsed.data.audit.exact_identification,
            // App-authored only. The model's own audit note was transported to
            // the client on every successful classification although no UI
            // renders it — free-form provider prose crossing the boundary for
            // no purpose. Its flags are still honoured above.
            note: admitted.hardLimit
              ? "Remote output reported a prohibited inference. High-consequence categories were kept; the rest was discarded."
              : "Remote classification completed within the closed contract.",
          };
        }
      }
    }

    const observationReport = buildObservationReport({
      mediaMode: data.media.mode,
      consent: data.consent,
      quality: data.media.quality,
      matches,
      allowedFrameIds: data.frameLabels,
      modelStatus,
      triage,
      hardLimit: selfAudit.hardLimit,
    });
    // The legacy coach shape remains internal compatibility only. No free-form
    // model action prose enters it; local rules generate its fixed stop/observe text.
    const report = fuseCoach({
      det:
        observationReport.urgent_stop || observationReport.disposition === "do_not_proceed"
          ? visualHaltReport(effectiveDet)
          : effectiveDet,
      frames: [],
      llm: null,
      tie,
      stepIndex,
      elapsedSec,
      priorNerveHits: 0,
      hardNos,
    });

    return {
      ok: true,
      llm: null,
      selfAudit,
      refusal,
      modelStatus,
      report,
      observationReport,
      ...(providerFailure ? { providerFailure } : {}),
      ...(providerRetryAfterMs !== undefined ? { retryAfterMs: providerRetryAfterMs } : {}),
    };
  }
}

function closeClientHeuristic(det: DeterministicReport): DeterministicReport {
  const stop = det.recommend === "stop" || det.flags.some((flag) => flag.severity === "stop");
  const flags: SafetyFlag[] = stop
    ? [
        {
          code: "unknown",
          severity: "stop",
          note: "An untrusted client hint requested a conservative stop. Release and assess directly; the image cannot establish cause or severity.",
        },
      ]
    : [];
  return {
    ...det,
    neckRope: 0,
    paleness: 0,
    palenessDelta: 0,
    flags,
    recommend: stop ? "stop" : "adjust",
    notes: [
      "Client image hints are unvalidated and cannot establish age, consent, physiology, load, category absence, or technique.",
    ],
  };
}

function visualHaltReport(det: DeterministicReport): DeterministicReport {
  return {
    ...det,
    flags: [
      {
        code: "unknown",
        severity: "stop",
        note: "The limited visual report requires stopping. Release and assess directly; the image cannot establish cause or severity.",
      },
    ],
    recommend: "stop",
  };
}

function triageStopReport(det: DeterministicReport, triage: TriageState): DeterministicReport {
  return {
    ...det,
    flags: [
      {
        code: "unknown",
        severity: "stop",
        note:
          triage === "emergency"
            ? "An urgent symptom or event was reported directly. Release now and call emergency services; do not delay for an image."
            : triage === "prompt_medical"
              ? "A persistent or worsening symptom after release was reported. Do not re-tie; seek prompt medical assessment."
              : "Current voluntary activity and media permission were not confirmed. Stop the activity and recording; do not analyze or share the media.",
      },
    ],
    recommend: "stop",
  };
}
