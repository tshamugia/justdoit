"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, HelpCircle } from "lucide-react";

interface Attendee {
  id: string;
  full_name: string;
  avatar_url: string | null;
  status: "in" | "maybe";
}

interface RsvpListProps {
  attendees: Attendee[];
  isAnonymous?: boolean;
}

export function RsvpList({ attendees, isAnonymous = false }: RsvpListProps) {
  const confirmed = attendees.filter((a) => a.status === "in");
  const maybe = attendees.filter((a) => a.status === "maybe");

  if (isAnonymous) {
    return (
      <div className="space-y-2">
        {confirmed.length > 0 && (
          <p className="text-sm flex items-center gap-1">
            <Check className="h-4 w-4 text-green-600" />
            {confirmed.length} attendee{confirmed.length !== 1 ? "s" : ""} confirmed
          </p>
        )}
        {maybe.length > 0 && (
          <p className="text-sm flex items-center gap-1">
            <HelpCircle className="h-4 w-4 text-amber-600" />
            {maybe.length} maybe
          </p>
        )}
        {attendees.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No RSVPs yet. Be the first!
          </p>
        )}
        <p className="text-xs text-muted-foreground italic">
          Attendee names are hidden for this event.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {confirmed.length > 0 && (
        <div>
          <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
            <Check className="h-4 w-4 text-green-600" /> Confirmed (
            {confirmed.length})
          </h4>
          <AttendeeList attendees={confirmed} />
        </div>
      )}
      {maybe.length > 0 && (
        <div>
          <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
            <HelpCircle className="h-4 w-4 text-amber-600" /> Maybe (
            {maybe.length})
          </h4>
          <AttendeeList attendees={maybe} />
        </div>
      )}
      {attendees.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No RSVPs yet. Be the first!
        </p>
      )}
    </div>
  );
}

function AttendeeList({ attendees }: { attendees: Attendee[] }) {
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {attendees.map((a) => (
          <motion.div
            key={a.id}
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-2"
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={a.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">
                {a.full_name?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{a.full_name}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
