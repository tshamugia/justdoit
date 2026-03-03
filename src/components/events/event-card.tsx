"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ProgressIndicator } from "./progress-indicator";
import { EventStatusBadge } from "./event-status-badge";
import { RsvpButtons } from "@/components/rsvp/rsvp-buttons";
import { RsvpSummary } from "@/components/rsvp/rsvp-summary";
import { useRsvp } from "@/hooks/use-rsvp";
import type { EventWithCounts, RsvpStatus } from "@/lib/types/database.types";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CATEGORY_EMOJI: Record<string, string> = {
  bar: "🍺",
  food: "🍕",
  outdoor: "🌳",
  other: "",
};

interface EventCardProps {
  event: EventWithCounts;
  userId: string;
  workspaceId: string;
  index?: number;
}

export function EventCard({
  event,
  userId,
  workspaceId,
  index = 0,
}: EventCardProps) {
  const { upsertRsvp, withdrawRsvp } = useRsvp(workspaceId);
  const isExpired = event.status === "expired";

  const handleRsvp = (status: RsvpStatus) => {
    upsertRsvp.mutate({ eventId: event.id, userId, status });
  };

  const handleWithdraw = () => {
    withdrawRsvp.mutate({ eventId: event.id, userId });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className={cn(
        "transition-colors",
        isExpired && "opacity-60",
        event.status === "happening" && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
      )}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/events/${event.id}`} className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate hover:underline">
                {CATEGORY_EMOJI[event.category] && (
                  <span className="mr-1">{CATEGORY_EMOJI[event.category]}</span>
                )}
                {event.title}
              </h3>
            </Link>
            <EventStatusBadge status={event.status} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(parseISO(event.event_date), "EEE, MMM d")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {event.event_time.slice(0, 5)}
            </span>
            {event.location && (
              <a
                href={`https://www.google.com/maps/search/bars+near+${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <MapPin className="h-3.5 w-3.5" />
                {event.location}
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="h-5 w-5">
              <AvatarImage src={event.creator_avatar ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {event.creator_name?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span>{event.creator_name}</span>
          </div>

          <ProgressIndicator
            inCount={event.in_count}
            minAttendees={event.min_attendees}
            maxAttendees={event.max_attendees}
            status={event.status}
          />

          <div className="flex items-center justify-between pt-1">
            <RsvpSummary
              inCount={event.in_count}
              maybeCount={event.maybe_count}
            />
            <RsvpButtons
              currentUserRsvp={event.current_user_rsvp}
              eventStatus={event.status}
              maxAttendees={event.max_attendees}
              inCount={event.in_count}
              onRsvp={handleRsvp}
              onWithdraw={handleWithdraw}
              loading={upsertRsvp.isPending || withdrawRsvp.isPending}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
