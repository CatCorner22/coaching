# Knotty

An adult-only, consent-centered rope education app with a privacy-minimized camera path.

The camera accepts photos or short clips, converts video to user-selected labeled stills, and returns a closed observation report with broad canonical categories, evidence state, consequence floor, confounders, abstention, limitations, and a bounded next-action ID. It does **not** infer age, consent, physiology, pain, pressure, force, load, injury, exact ties, technique correctness, or safety. It does not live-monitor video or provide next-wrap coaching.

## Camera privacy and safety boundary

- Per batch: legal-adult attestation; an upload-scope attestation whose wording matches this deployment's `VITE_MEDIA_UPLOAD_SCOPE` (clothed/intimate-wear only, or adult nudity at most); separate non-secret, non-coerced, and all-people-consented attestations; and separate activity, recording, upload, and output permission. The server rejects a batch whose scope field does not match the deployment.
- Prefer equipment-only or non-identifying media; exclude faces, tattoos, screens, mail, and room details.
- What may be uploaded is an operator setting, `VITE_MEDIA_UPLOAD_SCOPE` (see **Upload scope** below). Intimate wear is always within it; full nudity is within it only when the operator has set it so; explicit sexual activity never is.
- Two limits are not the provider's policy and are not configurable at any setting: apparent or ambiguous minor age, and secretly or coercively obtained media. Both are refused as required attestations, a coercion-triage stop, and passthrough of provider refusals — not as detection. The prompt itself forbids inferring age or consent. The honest framing used for nudity (an operator attestation, not automatic content moderation) applies to these two as well.
- The setting governs the upload only. It says nothing about what anyone photographs, keeps, or shares, and the app has no visibility into any of that — its controls end at its own local batch.
- The non-explicit boundary is an operator attestation, not automatic content moderation. The app does not certify or reliably detect nudity; do not select explicit media.
- Video stays local and is reduced to one to three stills selected by the user.
- Remote analysis and reviewed cloud voice require an operator-enabled xAI team-wide Zero Data Retention setting. Before every selected-media or TTS request, the server sends a fixed text-only probe with the same snapshotted API key and requires an exact `x-zero-data-retention: true` response; it requires the same header again before reading the media or audio response. Failed probes send no selected media. Missing or unavailable confirmation after dispatch causes the response to be discarded and the one-use media batch to remain closed.
- The current page submits a confirmed batch at most once. A shared Postgres reservation rejects the same verified-user batch across replicas for two hours, exceeding the one-hour permission window; this is not a permanent global exactly-once guarantee. Already-transmitted data cannot be recalled.
- C3 categories route to qualified in-person instruction. C4 categories stop or decline. Every other result remains lower-consequence learning only or insufficient view—never clearance.
- Directly reported symptoms and coercion bypass image analysis and route action first.

## Using it

Run it locally with `npm run dev` (port 8080). Cloud analysis and cloud voice cost money on the app owner's xAI account, so the dev server refuses them unless you opt in: set `ALLOW_DEV_AI=true` alongside `XAI_API_KEY` (and `XAI_REQUIRE_ZERO_DATA_RETENTION=true`) in the shell you start it from. Without it every Analyze returns "Development AI is disabled" and no media leaves the machine. Dev requests are accepted from `localhost` and from the LAN address the dev server binds; a deployed app only trusts its configured origin. The camera needs a secure context, so live capture works on `localhost` and on HTTPS, not on a plain-HTTP LAN address — on a phone, reach it over HTTPS or import from the photo library instead.

**Run it on Replit.** Import this repository into Replit (Create Repl → Import from GitHub) and press Run. The committed `.replit` pins Node 22 to match `engines`, installs dependencies if the workspace has none yet, forwards port 8080, and starts the dev server. No secrets are required: auth stays off and the dev database is the embedded in-memory PGLite instance. Replit serves the Repl over HTTPS, which is also what makes live camera capture work there — `getUserMedia` needs a secure context, so a plain-HTTP LAN address cannot do it. Hot reload works through the proxy as well.

The **Deploy** button is deliberately refused, with an explanation. A Replit Deployment has no build of its own here, so it would fall back to the workspace Run command and publish the dev server — which accepts a shared development identity on the AI endpoints, runs auth in development mode, and keeps every negotiated limit and journal entry in a database that is discarded on restart. Those are all correct for a dev server and all wrong to expose. The supported production target is a Vercel build (`npm run build`), and it has real prerequisites — see **Deployment requirements** below.

**The adult gate** asks for one combined attestation — both adults, chosen together for tonight, shears within reach, camera and Studio Analyze agreed — before anything opens, and reappears per browser profile. It is not a login. The four separate attestations are per analyze batch, not at the door.

**Negotiated limits gate the app.** Every restraint category and every guided tie maps to at least one limit and stays blocked — in Studio and on the tie page — until that limit is set to yes on `/negotiate`. Takate-kote needs `gote`, the karada family needs `torso`, arm ties need `arms`, leg ties need `legs`, matanawa needs `crotch`, and the two guided restraint ties (single-column, double-column) need `cuffs`. Unoccupied prop drills — the cuff-pattern drill, the hexagon net, the diamond column — are open from the start; they put rope on nobody. The catalog entry named `single-column` is not one of those drills: it is the guided on-a-person lesson, and it waits for `cuffs`. The `photos` limit gates the whole camera path, including the local practice cam on taught tie pages. Cloud observation lives only in the Studio, behind the per-batch attestations. Four limits — neck, breath, suspension, alone — are locked to no and cannot be set otherwise, so partial-suspension, neck rope and every suspension category stay blocked however the list is edited. The list also carries the activity families beyond rope, one row each, because a single "impact" row would cover a hand and a cane alike. Limits sync between open tabs, and a revocation in one tab wins over a stale tab's later save.

**What's in the catalog.** 63 ties and 92 articles. Ties come in exactly three shapes, labelled on every card:

| Shape | What it means |
| --- | --- |
| **Taught step by step** | The full sequence, from rehearsing the release to checking again the next morning. May go on a consenting adult once its negotiated limit is agreed. |
| **Prop drill** | Handling practice for a dress form. Nobody is placed in rope. |
| **Instructor route** | The category and its risk family, named — and nothing more. |

The line between the second and third is not how advanced a tie looks. It is whether written instruction has a track record of producing injury. Limb cuffs, decorative patterns, handling, tension and removal are taught in writing everywhere and are taught here. Upper-arm bands — the box-tie and chest-harness family — are the documented source of most rope nerve injury, they fail without a visible warning, and they stay instructor-only. So does anything bearing weight, anything on the neck, anything restricting breathing.

Every check in a taught tie tells you when to stop. None tells you it is safe to continue, because none can: nerve compression happens without changing circulation, so colour, warmth and capillary refill stay normal while the damage does. The catalog says this out loud on every taught tie rather than leaving it implied.

The articles cover consent and negotiation, the body and how rope actually injures it, technique and craft, scene practice, D/s protocol and power exchange, the activity families combined with rope, aftercare, and risk. Each carries an evidence panel saying whether it is source-anchored or app-authored.

**Rig mode** (`/rig`, or the button in the Studio header) is the same session with the chrome removed: elapsed time and the direct-check countdown in large type, the current step, and the two safeword buttons at the bottom where a thumb reaches. It holds a screen wake lock so the phone stops locking mid-tie — where the browser allows it; the header says "Screen may sleep" when it does not — and pulses once when the check reminder elapses. It observes nothing and clears nothing; the countdown is the reminder you set on `/settings`, not a deadline.

**Safewords.** Set yours on `/settings`; the plain words *red* and *yellow* are always heard as well. Optional microphone detection fires only when a word is called out, not when it appears inside a sentence — "hand me the red rope" does not stop the session. Red stops and raises the release banner; yellow raises a check-in banner and leaves the session running. Browser speech recognition can fail silently and is never a substitute for a physical stop signal, particularly with anything over the mouth.

**What is saved, and where.** Everything is local to the browser; there is no account sync.

| | Saved |
| --- | --- |
| Negotiated limits, settings, journal entries | Browser storage, merged across tabs |
| Direct check-ins | The open tab only — they hold health and consent detail and are deliberately not written to storage |
| Captures and clips | Page memory until replaced, stopped, or the page closes |

If a save ever fails — a full device, or a browser blocking storage — a banner says so on every screen. Treat what is on screen as unsaved until it clears.

**Journal backups are encrypted.** `/journal` exports the journal as a single passphrase-encrypted file (AES-GCM, PBKDF2-SHA256 at 600,000 iterations), because an export lands in a downloads folder and downloads folders get synced. Restore never replaces the journal; it merges, applies deletions recorded in the file, and reports how many. There is no recovery: lose the passphrase and the file is gone. This does not encrypt the journal inside the browser, which stays as described above. The plaintext export is still available, one tap further away.

**The emergency card** at `/emergency` is the first item in the mobile More sheet, is offered from the stop banner, and works without passing the adult gate. It also works with no network: a service worker (`public/sw.js`) precaches a self-contained copy on first load and serves it when the live page cannot be fetched, so a sleeping laptop or dropped wifi does not take the card with it. The offline copy says that it is the offline copy. Neither version guesses an emergency number from browser language or location — use the device's dialer.

**What the camera does not do.** It never infers age, consent, physiology, pain, pressure, load, injury, or safety, and no result is ever clearance. Remote analysis is one request per confirmed batch and cannot be recalled once sent.

## Upload scope

`VITE_MEDIA_UPLOAD_SCOPE` records what this deployment may transmit to the analysis provider. It is an operator setting rather than an in-app toggle: it answers a question about the provider's acceptable-use policy, not about any one batch, so it is read once from the build environment and cannot be flipped mid-scene.

| Value | Uploads |
| --- | --- |
| `non_explicit` (default) | Clothed and intimate-wear views of consenting adults. |
| `adult_nudity` | Adds full nudity of confirmed adults. Sexual activity is still refused. |

**This repository is configured for `adult_nudity`**, recorded in `DEFAULT_APP_ENV` in `scripts/with-app-env.mjs` so it travels with the repo and applies to `dev`, `build` and `preview` alike. The owner set it having accepted that the provider's Acceptable Use Policy is the governing document and that this repository cannot verify it.

To change it, edit that value, or override it without touching the repo:

- `.grok/app-env.json` in a workspace (gitignored, so it does not survive a fresh clone or reach a deployment), or
- a real `VITE_MEDIA_UPLOAD_SCOPE` in the deployment's project environment, which beats both.

An unrecognised value falls back to `non_explicit` rather than widening, so a typo cannot silently open the boundary. Read the provider's current Acceptable Use Policy before changing it upward; a policy change changes what this setting is allowed to be. The capture panel states the setting in force on every batch. The server receives that setting as `consent.scope`, rejects a mismatch, and builds the classifier prompt from it: an `adult_nudity` deployment tells the model the media may include nudity of consenting adults and that sexual activity is still out of scope. The two hard refusals — apparent or ambiguous minor age, and secretly or coercively obtained media — stay refused at every setting.

## Development

The project targets Node 22.

The supported npm wrappers default standalone development to `VITE_AUTH_ENABLED=false`; production must explicitly set it to `true` and provide the configured identity service. Do not start Vite directly, because that bypasses the shared environment wrapper.

```sh
npm ci --ignore-scripts
npm run build
npm run typecheck
npm run lint
npm test
```

Camera and media behavior still requires real-device checks on current iOS Safari, Android Chrome, desktop Chromium, Firefox, and Safari. Unit tests cannot establish camera permissions, decoder support, MediaRecorder interoperability, accessibility, or safe real-world use.

PGLite is a `npm run dev` convenience only. Production builds, `npm run preview`,
and `npm run build:dev` do not use an embedded database; configure
`DATABASE_URL` before exercising any server-side database path in those modes.
`npm run build` is deliberately side-effect-free. Run `npm run db:migrate` once
from a protected release job against the intended environment before promoting
the already-verified artifact; never expose a production database URL to an
untrusted pull-request or preview build.

## Private use from phones (Tailscale)

The camera only opens in a secure context, so a phone cannot use it against
`http://<laptop-ip>:8080`. The simplest private route is the dev server on a
laptop behind Tailscale, which gives every device on your tailnet a trusted
HTTPS address without exposing anything to the internet.

One-time:

1. Install Tailscale on the laptop and each phone; sign all of them in to the same account.
2. In the Tailscale admin console under DNS, enable **MagicDNS** and **HTTPS Certificates**.
3. On the laptop, from the repo: `npm ci --ignore-scripts`.
4. `tailscale serve --bg --https=443 http://localhost:8080` — it prints the address, e.g. `https://laptop.tail1234.ts.net`. The rule survives reboots; `tailscale serve status` shows it and `tailscale serve reset` removes it. Never use `tailscale funnel`, which is public.

Each session:

Use your own hostname from step 4 in place of `laptop.tail1234.ts.net`; the
first variable adds it to the dev server's Host allowlist.

```sh
__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=laptop.tail1234.ts.net npm run dev
# with optional cloud Analyze (after verifying team-wide ZDR in the xAI console, see Deployment requirements):
__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=laptop.tail1234.ts.net XAI_API_KEY=... XAI_REQUIRE_ZERO_DATA_RETENTION=true ALLOW_DEV_AI=true BETTER_AUTH_URL=https://laptop.tail1234.ts.net npm run dev
```

`BETTER_AUTH_URL` here lets the AI origin check trust the Tailscale address; it
does not enable sign-in in development: everyone on the tailnet shares the
development identity, so this setup is only for a tailnet whose every device
you would hand your API key to. On the phones, with
Tailscale connected, open the `https://…ts.net` address, allow the camera, and
"Add to Home Screen". Each device keeps its own local data (negotiation,
journal, session), so run a scene from one device. The first certificate fetch
can take about thirty seconds; reload once if the phone reports a certificate
error.

## Deployment requirements

- Serve production over HTTPS. Live camera APIs are unavailable in an insecure context; `localhost` is the development exception.
- If embedded, the top-level site must deliberately grant the frame camera permission through Permissions Policy. The app never requests microphone audio as part of camera capture.
- Set provider-level spend/concurrency limits in addition to the per-user, per-instance application limits.
- Use a dedicated, access-restricted xAI team and API key for this deployment. Enable team-wide Zero Data Retention in the xAI console, verify it with a non-sensitive deployment probe, and only then set server-only `XAI_REQUIRE_ZERO_DATA_RETENTION=true`. An API key without this explicit flag leaves remote analysis and cloud voice unavailable. Keep provider-setting changes restricted: a setting can change between the preflight and request, so the second response-header check detects but cannot recall a request already initiated.
- Enable real authentication for production AI. Cost-bearing endpoints reject the shared development identity and require a same-origin browser request in production.
- Auth-on live preview requires the confidential `GROK_PREVIEW_CLIENT_SECRET` as a server-only injected variable. Never place it in `VITE_*`, source, client configuration, or build artifacts; rotate the previously shared preview credential before reuse.
- Confirm the applicable xAI account terms and Zero Data Retention eligibility before accepting personal data. ZDR does not establish anonymity, legal-adult status, consent, supported content, or safety; those remain operator attestations and product boundaries.
- Install from the committed `package-lock.json` with `npm ci --ignore-scripts`. CI uses exact Node 22.23.2 and fails if a production build changes the committed lockfile or generated route tree.
- Validate from a clean provider workspace with its generated `.grok/app-env.json`. CI runs the app-specific PWA fixture plus production desktop/mobile browser smoke, but provider authentication and camera hardware still require environment testing.

## Camera release matrix

For each target browser/device, verify: permission grant/deny/revoke, front/back switching, track interruption, live still capture, local photo import (JPEG/PNG/WebP/HEIC where supported), local video import (MP4/MOV/WebM where supported), native `MediaRecorder` round-trip, one-to-three still selection, backgrounding cleanup, permission withdrawal, oversized-media rejection, and that no audio track is requested. Record the browser/OS/device and a redacted result—never retain test participants’ sensitive media.
