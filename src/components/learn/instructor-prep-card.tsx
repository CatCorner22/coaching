import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

type InstructorPrepCardProps = {
  tieName: string;
  className?: string;
};

export function InstructorPrepCard({ tieName, className }: InstructorPrepCardProps) {
  return (
    <aside className={cn("rounded-xl border border-warn/35 bg-warn/8 p-5", className)}>
      <div className="flex items-start gap-3">
        <GraduationCap className="mt-0.5 size-5 shrink-0 text-warn" aria-hidden />
        <div>
          <h3 className="font-display text-lg text-warn">Instructor route</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            <strong className="font-medium text-fg">{tieName}</strong> is recognition and prep only in Knotty
            Academy. Do not construct this on a person from the app. Use these steps to rehearse vocabulary,
            risk questions, and release planning with a qualified instructor.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted">
            <li>Unoccupied form drills only</li>
            <li>Studio and camera observation disabled</li>
            <li>No body-loading or restraint clearance</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
