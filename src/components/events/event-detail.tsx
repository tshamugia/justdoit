"use client";

import { useEventDetail } from "@/hooks/use-events";
import { useRsvp } from "@/hooks/use-rsvp";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react";
import { EditEventDialog } from "./edit-event-dialog";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { ProgressIndicator } from "./progress-indicator";
import { EventStatusBadge } from "./event-status-badge";
import { RsvpButtons } from "@/components/rsvp/rsvp-buttons";
import { RsvpList } from "@/components/rsvp/rsvp-list";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import type { EventStatus, RsvpStatus } from "@/lib/types/database.types";
import { useEffect, useState } from "react";

const CATEGORY_EMOJI: Record<string, string> = {
  bar: "🍺",
  food: "🍕",
  outdoor: "🌳",
  other: "",
};

export function EventDetail({
  eventId,
  workspaceId,
}: {
  eventId: string;
  workspaceId: string;
}) {
  const { data, isLoading } = useEventDetail(eventId);
  const { upsertRsvp, withdrawRsvp } = useRsvp(workspaceId);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) setUserId(data.id);
      })
      .catch(() => {});
  }, []);

  if (isLoading || !data) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const { event, rsvps } = data;
  const profile = (event as any).profiles;
  const inCount = rsvps.filter((r: any) => r.status === "in").length;
  const maybeCount = rsvps.filter((r: any) => r.status === "maybe").length;
  const currentUserRsvp = rsvps.find((r: any) => r.user_id === userId);

  const attendees = rsvps.map((r: any) => ({
    id: r.user_id,
    full_name: r.profiles?.full_name ?? "Unknown",
    avatar_url: r.profiles?.avatar_url ?? null,
    status: r.status as "in" | "maybe",
  }));

  const handleRsvp = (status: RsvpStatus) => {
    upsertRsvp.mutate({ eventId, userId, status });
  };

  const handleWithdraw = () => {
    withdrawRsvp.mutate({ eventId, userId });
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/feed">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to feed
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl">
              {CATEGORY_EMOJI[event.category] && (
                <span className="mr-1">{CATEGORY_EMOJI[event.category]}</span>
              )}
              {event.title}
            </CardTitle>
            <div className="flex items-center gap-2 shrink-0">
              <EventStatusBadge status={event.status as EventStatus} />
              {userId && event.created_by === userId && (
                <EditEventDialog event={event} />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.description && (
            <p className="text-sm text-muted-foreground">
              {event.description}
            </p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(parseISO(event.event_date), "EEEE, MMMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {event.event_time.slice(0, 5)}
            </span>
            {event.location && (
              <a
                href={`https://www.google.com/maps/search/bars+near+${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground hover:underline"
              >
                <MapPin className="h-4 w-4" />
                {event.location}
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">
                {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span>Created by {profile?.full_name ?? "Unknown"}</span>
          </div>

          <ProgressIndicator
            inCount={inCount}
            minAttendees={event.min_attendees}
            maxAttendees={event.max_attendees}
            status={event.status as EventStatus}
          />

          <RsvpButtons
            currentUserRsvp={(currentUserRsvp as any)?.status ?? null}
            eventStatus={event.status as EventStatus}
            maxAttendees={event.max_attendees}
            inCount={inCount}
            onRsvp={handleRsvp}
            onWithdraw={handleWithdraw}
            loading={upsertRsvp.isPending || withdrawRsvp.isPending}
          />

          <Separator />

          <RsvpList attendees={attendees} isAnonymous={event.is_anonymous} />
        </CardContent>
      </Card>
    </div>
  );
}
