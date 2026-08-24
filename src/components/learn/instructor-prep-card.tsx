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
          <h3 className="font-display text-lg text-warn">Instructor route — look only</h3>
          <p className="mt-2 text-base leading-relaxed text-muted">
            <strong className="font-medium text-fg">{tieName}</strong> is for learning words and risks here. Do not tie
            this on a person from the app.
          </p>
          <ul className="mt-3 space-y-2 text-base text-muted">
            <li className="flex gap-2">
              <span className="text-warn" aria-hidden>
                •
              </span>
              Practice on an empty form only
            </li>
            <li className="flex gap-2">
              <span className="text-warn" aria-hidden>
                •
              </span>
              Camera / Studio is off for this route
            </li>
            <li className="flex gap-2">
              <span className="text-warn" aria-hidden>
                •
              </span>
              A qualified instructor must teach body use in person
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
