"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, HelpCircle, X } from "lucide-react";
import type { RsvpStatus, EventStatus } from "@/lib/types/database.types";

interface RsvpButtonsProps {
  currentUserRsvp: RsvpStatus | null;
  eventStatus: EventStatus;
  maxAttendees?: number | null;
  inCount: number;
  onRsvp: (status: RsvpStatus) => void;
  onWithdraw: () => void;
  loading?: boolean;
}

export function RsvpButtons({
  currentUserRsvp,
  eventStatus,
  maxAttendees,
  inCount,
  onRsvp,
  onWithdraw,
  loading,
}: RsvpButtonsProps) {
  const isExpired = eventStatus === "expired";
  const isFull = maxAttendees ? inCount >= maxAttendees : false;
  const canRsvpIn = !isExpired && (!isFull || currentUserRsvp === "in");

  return (
    <div className="flex gap-2">
      {currentUserRsvp ? (
        <>
          <RsvpBadge currentRsvp={currentUserRsvp} />
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onWithdraw}
              disabled={loading || isExpired}
              className="text-muted-foreground"
            >
              <X className="mr-1 h-3 w-3" />
              Withdraw
            </Button>
          </motion.div>
        </>
      ) : (
        <>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              onClick={() => onRsvp("in")}
              disabled={loading || !canRsvpIn}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="mr-1 h-3 w-3" />
              I&apos;m in
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRsvp("maybe")}
              disabled={loading || isExpired}
            >
              <HelpCircle className="mr-1 h-3 w-3" />
              Maybe
            </Button>
          </motion.div>
        </>
      )}
    </div>
  );
}

function RsvpBadge({ currentRsvp }: { currentRsvp: RsvpStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
        currentRsvp === "in"
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      }`}
    >
      {currentRsvp === "in" ? (
        <>
          <Check className="mr-1 h-3 w-3" /> You&apos;re in
        </>
      ) : (
        <>
          <HelpCircle className="mr-1 h-3 w-3" /> Maybe
        </>
      )}
    </span>
  );
}
