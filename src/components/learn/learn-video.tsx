import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * `loop` is an ambient prop clip: muted, autoplaying, endless, no chrome.
 *
 * `demo` is a demonstration of a person's hands working the rope, and it must
 * not behave that way. Watching hands is the strongest format there is for a
 * knot — hand-manipulation tasks are the documented exception to the rule that
 * moving displays teach worse than stills — but that result belongs to
 * segmented, user-paced playback. An autoplaying loop is precisely the
 * uncontrolled presentation the pacing article tells the reader was the
 * problem with every tutorial they gave up on, so shipping one here would
 * contradict the lesson sitting next to it.
 */
export type LearnVideoMode = "loop" | "demo";

type LearnVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  label?: string;
  mode?: LearnVideoMode;
};

/**
 * One fetch per session instead of one HEAD probe per clip per page.
 *
 * `public/learn/manifest.json` lists every learn-media file that actually
 * exists (add new clips there when adding the files). Probing each src
 * individually meant every taught page fired a burst of 404s for
 * never-generated demonstration clips — benign, but indistinguishable from
 * real asset breakage in the console. When the manifest itself is missing,
 * fall back to the old per-src probe rather than hiding media that exists.
 */
let manifestPromise: Promise<ReadonlySet<string> | null> | null = null;
function loadLearnMediaManifest(): Promise<ReadonlySet<string> | null> {
  manifestPromise ??= fetch("/learn/manifest.json")
    .then(async (res) => {
      if (!res.ok) return null;
      const parsed: unknown = await res.json();
      const files = (parsed as { files?: unknown })?.files;
      return Array.isArray(files)
        ? new Set(files.filter((f): f is string => typeof f === "string"))
        : null;
    })
    .catch(() => null);
  return manifestPromise;
}

/** Practice clip. Hidden when the file is missing (procedural fallback). */
export function LearnVideo({ src, poster, className, label, mode = "loop" }: LearnVideoProps) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const isDemo = mode === "demo";

  useEffect(() => {
    let cancelled = false;
    setAvailable(null);
    loadLearnMediaManifest()
      .then((manifest) => {
        if (cancelled) return;
        if (manifest) {
          setAvailable(manifest.has(src));
          return;
        }
        return fetch(src, { method: "HEAD" }).then((res) => {
          if (!cancelled) setAvailable(res.ok);
        });
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (available === false || available === null) return null;

  const caption = label ?? (isDemo ? "Demonstration — replay as often as you like" : "Silent practice loop · prop only");

  return (
    <figure className={cn("learn-video overflow-hidden rounded-lg border border-border bg-elevated", className)}>
      <video
        src={src}
        poster={poster}
        muted
        loop={!isDemo}
        playsInline
        autoPlay={!isDemo}
        controls={isDemo}
        preload="metadata"
        className="aspect-[5/4] w-full object-cover"
        aria-label={caption}
      />
      <figcaption className="px-3 py-2 text-center text-xs text-muted">{caption}</figcaption>
    </figure>
  );
}
