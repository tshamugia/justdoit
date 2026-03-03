"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "@/lib/types/database.types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  EventStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  happening: {
    label: "Happening!",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  at_risk: {
    label: "At Risk",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  expired: {
    label: "Expired",
    className:
      "bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400",
  },
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const config = statusConfig[status];

  if (status === "happening") {
    return (
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <Badge
          variant="secondary"
          className={cn("font-semibold", config.className)}
        >
          {config.label}
        </Badge>
      </motion.div>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn("font-semibold", config.className)}
    >
      {config.label}
    </Badge>
  );
}
