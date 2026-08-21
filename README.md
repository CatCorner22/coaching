# Knotty

An adult-only, consent-centered rope education app with a privacy-minimized camera path.

The camera accepts photos or short clips, converts video to user-selected labeled stills, and returns a closed observation report with broad canonical categories, evidence state, consequence floor, confounders, abstention, limitations, and a bounded next-action ID. It does **not** infer age, consent, physiology, pain, pressure, force, load, injury, exact ties, technique correctness, or safety. It does not live-monitor video or provide next-wrap coaching.

## Camera privacy and safety boundary

- Per batch: legal-adult attestation; separate clothed/non-explicit, non-secret, non-coerced, and all-people-consented attestations; and separate activity, recording, upload, and output permission.
- Prefer equipment-only or clothed, non-identifying media; exclude faces, intimate contact, tattoos, screens, mail, and room details.
- The non-explicit boundary is an operator attestation, not automatic content moderation. The app does not certify or reliably detect nudity; do not select explicit media.
- Video stays local and is reduced to one to three stills selected by the user.
- The current page submits a confirmed batch at most once. A shared Postgres reservation rejects the same verified-user batch across replicas for two hours, exceeding the one-hour permission window; this is not a permanent global exactly-once guarantee. Already-transmitted data cannot be recalled.
- C3 categories route to qualified in-person instruction. C4 categories stop or decline. Every other result remains lower-consequence learning only or insufficient view—never clearance.
- Directly reported symptoms and coercion bypass image analysis and route action first.

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

## Deployment requirements

- Serve production over HTTPS. Live camera APIs are unavailable in an insecure context; `localhost` is the development exception.
- If embedded, the top-level site must deliberately grant the frame camera permission through Permissions Policy. The app never requests microphone audio as part of camera capture.
- Set provider-level spend/concurrency limits in addition to the per-user, per-instance application limits.
- Enable real authentication for production AI. Cost-bearing endpoints reject the shared development identity and require a same-origin browser request in production.
- Auth-on live preview requires the confidential `GROK_PREVIEW_CLIENT_SECRET` as a server-only injected variable. Never place it in `VITE_*`, source, client configuration, or build artifacts; rotate the previously shared preview credential before reuse.
- Confirm the applicable xAI account terms, retention configuration, and availability of Zero Data Retention before accepting personal data. The UI assumes already-transmitted requests cannot be recalled.
- Install from the committed `package-lock.json` with `npm ci --ignore-scripts`. CI uses exact Node 22.23.2 and fails if a production build changes the committed lockfile or generated route tree.
- Validate from a clean provider workspace with its generated `.grok/app-env.json`. CI runs the app-specific PWA fixture plus production desktop/mobile browser smoke, but provider authentication and camera hardware still require environment testing.

## Camera release matrix

For each target browser/device, verify: permission grant/deny/revoke, front/back switching, track interruption, live still capture, local photo import (JPEG/PNG/WebP/HEIC where supported), local video import (MP4/MOV/WebM where supported), native `MediaRecorder` round-trip, one-to-three still selection, backgrounding cleanup, permission withdrawal, oversized-media rejection, and that no audio track is requested. Record the browser/OS/device and a redacted result—never retain test participants’ sensitive media.
