"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { EventWithCounts } from "@/lib/types/database.types";

export function useEvents(workspaceId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.events(workspaceId ?? ""),
    queryFn: async (): Promise<EventWithCounts[]> => {
      const res = await fetch(
        `/api/events?workspaceId=${encodeURIComponent(workspaceId!)}`
      );
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
    enabled: !!workspaceId,
  });
}

export function useEventDetail(eventId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.event(eventId ?? ""),
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}`);
      if (!res.ok) throw new Error("Failed to fetch event");
      return res.json();
    },
    enabled: !!eventId,
  });
}
