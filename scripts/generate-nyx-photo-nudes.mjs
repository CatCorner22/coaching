#!/usr/bin/env node
/**
 * Generate Nyx photo nudes via xAI Grok Imagine and save to public/instructor/nyx/nude/.
 *
 * Usage:
 *   XAI_API_KEY=xai-... node scripts/generate-nyx-photo-nudes.mjs
 *   XAI_API_KEY=xai-... node scripts/generate-nyx-photo-nudes.mjs stand-front seated kneeling
 *
 * Requires network + a valid xAI API key with Imagine access. Content moderation may
 * refuse some prompts — skipped poses are reported at the end.
 */
import { mkdirSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import {
  NYX_PHOTO_NUDE_POSES,
  NYX_PHOTO_NUDE_PROMPTS,
  nyxPhotoNudeFile,
} from "./nyx-photo-nude-manifest.mjs";

const ROOT = join(import.meta.dirname, "..");
const OUT_DIR = join(ROOT, "public/instructor/nyx/nude");
const MODEL = "grok-imagine-image-2.0";

async function generateOne(prompt) {
  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Set XAI_API_KEY to your xAI developer key.");
  }

  const res = await fetch("https://api.x.ai/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      aspect_ratio: "3:4",
      resolution: "1k",
      response_format: "b64_json",
      n: 1,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`xAI ${res.status}: ${raw.slice(0, 400)}`);
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new Error("xAI returned non-JSON");
  }

  const item = body.data?.[0];
  if (body.respect_moderation === false || item?.respect_moderation === false) {
    return { ok: false, moderated: true };
  }

  const b64 = item?.b64_json;
  if (!b64) {
    const url = item?.url;
    if (!url) throw new Error("No image in xAI response");
    const imgRes = await fetch(url);
    if (!imgRes.ok) throw new Error(`Failed to download ${url}`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    return { ok: true, bytes: buf };
  }

  return { ok: true, bytes: Buffer.from(b64, "base64") };
}

function toWebp(pngOrJpgPath, webpPath) {
  execFileSync("ffmpeg", ["-y", "-i", pngOrJpgPath, "-c:v", "libwebp", "-quality", "82", webpPath], {
    stdio: "pipe",
  });
}

function writeManifest() {
  const files = readdirSync(OUT_DIR).filter(
    (name) => name.startsWith("nyx-nude-") && name.endsWith(".webp"),
  );
  const photos = files
    .map((name) => name.slice("nyx-nude-".length, -".webp".length))
    .filter((pose) => NYX_PHOTO_NUDE_POSES.includes(pose))
    .sort();
  writeFileSync(join(OUT_DIR, "manifest.json"), `${JSON.stringify({ photos }, null, 2)}\n`);
  return photos;
}

async function main() {
  const requested = process.argv.slice(2);
  const poses =
    requested.length > 0
      ? NYX_PHOTO_NUDE_POSES.filter((p) => requested.includes(p))
      : [...NYX_PHOTO_NUDE_POSES];

  if (poses.length === 0) {
    console.error("No matching poses. Available:", NYX_PHOTO_NUDE_POSES.join(", "));
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const results = { ok: [], skipped: [], failed: [] };

  for (const pose of poses) {
    const out = join(OUT_DIR, nyxPhotoNudeFile(pose));
    if (existsSync(out)) {
      results.skipped.push(`${pose} (already exists)`);
      continue;
    }

    process.stdout.write(`Generating ${pose}… `);
    try {
      const gen = await generateOne(NYX_PHOTO_NUDE_PROMPTS[pose]);
      if (!gen.ok) {
        console.log("moderated");
        results.failed.push(`${pose} (content moderation)`);
        continue;
      }

      const tmp = join(OUT_DIR, `_tmp-${pose}.png`);
      writeFileSync(tmp, gen.bytes);
      toWebp(tmp, out);
      try {
        execFileSync("rm", [tmp]);
      } catch {
        /* ignore */
      }
      console.log("saved");
      results.ok.push(pose);
    } catch (err) {
      console.log("error");
      results.failed.push(`${pose}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const manifest = writeManifest();
  console.log(JSON.stringify({ outDir: OUT_DIR, manifest, ...results }, null, 2));
  if (results.ok.length === 0 && results.skipped.length === 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
