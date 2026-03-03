"use client";

import { EventCard } from "./event-card";
import { EventCardSkeleton } from "./event-card-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import type { EventWithCounts } from "@/lib/types/database.types";
import { CalendarPlus } from "lucide-react";

interface EventListProps {
  events: EventWithCounts[] | undefined;
  isLoading: boolean;
  userId: string;
  workspaceId: string;
}

export function EventList({
  events,
  isLoading,
  userId,
  workspaceId,
}: EventListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const activeEvents = events?.filter((e) => e.status !== "expired") ?? [];
  const expiredEvents = events?.filter((e) => e.status === "expired") ?? [];

  if (!events?.length) {
    return (
      <EmptyState
        icon={CalendarPlus}
        title="No events yet"
        description="Be the first to create an event in this workspace!"
        actionLabel="Create Event"
        actionHref="/events/create"
      />
    );
  }

  return (
    <div className="space-y-3">
      {activeEvents.map((event, i) => (
        <EventCard
          key={event.id}
          event={event}
          userId={userId}
          workspaceId={workspaceId}
          index={i}
        />
      ))}
      {expiredEvents.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-muted-foreground pt-4">
            Past Events
          </h3>
          {expiredEvents.map((event, i) => (
            <EventCard
              key={event.id}
              event={event}
              userId={userId}
              workspaceId={workspaceId}
              index={activeEvents.length + i}
            />
          ))}
        </>
      )}
    </div>
  );
}
