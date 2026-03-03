import { Users } from "lucide-react";

interface RsvpSummaryProps {
  inCount: number;
  maybeCount: number;
}

export function RsvpSummary({ inCount, maybeCount }: RsvpSummaryProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        {inCount} in
      </span>
      {maybeCount > 0 && <span>{maybeCount} maybe</span>}
    </div>
  );
}
