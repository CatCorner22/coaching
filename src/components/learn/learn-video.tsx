import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type LearnVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  label?: string;
};

/** Muted, looping prop-only clip. Hidden when the file is missing (procedural fallback). */
export function LearnVideo({ src, poster, className, label = "Silent practice loop" }: LearnVideoProps) {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    setAvailable(null);
    fetch(src, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setAvailable(res.ok);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (available === false || available === null) return null;

  return (
    <figure className={cn("learn-video overflow-hidden rounded-lg border border-border bg-elevated", className)}>
      <video
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        className="aspect-[5/4] w-full object-cover"
        aria-label={label}
      />
      <figcaption className="px-3 py-2 text-center text-xs text-muted">{label} · prop only</figcaption>
    </figure>
  );
}
