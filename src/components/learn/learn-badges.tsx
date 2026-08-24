import { Badge } from "@/components/ui/badge";
import type { Knot, Tie } from "@/lib/kb/types";

export function PropOnlyBadge() {
  return (
    <Badge className="border-ok/30 bg-ok/10 text-ok" title="Practice on an empty prop only">
      Prop only
    </Badge>
  );
}

export function InstructorRouteBadge() {
  return (
    <Badge variant="warn" title="Recognition and prep — not body construction">
      Instructor route
    </Badge>
  );
}

export function CinchBadge({ cinches }: { cinches: boolean }) {
  return (
    <Badge variant={cinches ? "warn" : "ok"}>{cinches ? "Cinches shut" : "Does not cinch"}</Badge>
  );
}

export function LoadBadge({ loadBearing }: { loadBearing: boolean }) {
  if (!loadBearing) return null;
  return <Badge title="Load-bearing category — learn in person">Load category</Badge>;
}

export function AcademyBadges({ knot }: { knot: Knot }) {
  return (
    <>
      <PropOnlyBadge />
      <CinchBadge cinches={knot.cinches} />
      <LoadBadge loadBearing={knot.loadBearing} />
    </>
  );
}

export function TieAcademyBadges({ tie, foundation }: { tie: Tie; foundation?: boolean }) {
  return (
    <>
      {foundation && (
        <Badge className="border-accent/30 bg-accent/10 text-accent">Academy</Badge>
      )}
      {tie.minutes[1] === 0 ? <InstructorRouteBadge /> : <PropOnlyBadge />}
      <Badge>{tie.level}</Badge>
    </>
  );
}
