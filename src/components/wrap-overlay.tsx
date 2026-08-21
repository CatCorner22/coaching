import type { FrameObservation } from "@/lib/ml/types";

export function WrapOverlay({
  src,
  obs,
}: {
  src: string;
  obs?: FrameObservation | null;
}) {
  if (!src) return null;
  return (
    <div className="relative overflow-hidden rounded-lg">
      <img src={src} alt="Captured still with wrap overlay" className="max-h-72 w-full object-cover" />
      {obs && (
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${obs.width} ${obs.height}`} preserveAspectRatio="none">
          {obs.body && (
            <rect
              x={obs.body.x}
              y={obs.body.y}
              width={obs.body.w}
              height={obs.body.h}
              fill="none"
              stroke="rgba(200,168,125,0.7)"
              strokeWidth="2"
            />
          )}
          {obs.wrapBands.map((b, i) => (
            <line
              key={i}
              x1={obs.body?.x ?? 0}
              x2={(obs.body?.x ?? 0) + (obs.body?.w ?? obs.width)}
              y1={b.yNorm * obs.height}
              y2={b.yNorm * obs.height}
              stroke="rgba(232,93,69,0.9)"
              strokeWidth={2 + b.strength * 4}
            />
          ))}
          {obs.neckRope > 0.15 && (
            <text x="8" y="18" fill="#e85d45" fontSize="12">
              Neck flag
            </text>
          )}
        </svg>
      )}
    </div>
  );
}
