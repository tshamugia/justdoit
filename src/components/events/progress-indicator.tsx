"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { EventStatus } from "@/lib/types/database.types";

interface ProgressIndicatorProps {
  inCount: number;
  minAttendees: number;
  maxAttendees?: number | null;
  status: EventStatus;
}

const statusColors: Record<EventStatus, string> = {
  pending: "bg-blue-500",
  happening: "bg-green-500",
  at_risk: "bg-amber-500",
  expired: "bg-gray-400",
};

export function ProgressIndicator({
  inCount,
  minAttendees,
  maxAttendees,
  status,
}: ProgressIndicatorProps) {
  const target = maxAttendees ?? minAttendees;
  const percentage = Math.min((inCount / target) * 100, 100);
  const thresholdPercentage = maxAttendees
    ? (minAttendees / maxAttendees) * 100
    : 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{inCount} confirmed</span>
        <span>
          min {minAttendees}
          {maxAttendees ? ` / max ${maxAttendees}` : ""}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className={cn("h-full rounded-full", statusColors[status])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
        {maxAttendees && (
          <div
            className="absolute top-0 h-full w-0.5 bg-foreground/30"
            style={{ left: `${thresholdPercentage}%` }}
          />
        )}
      </div>
    </div>
  );
}
