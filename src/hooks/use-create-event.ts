"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface EventInsert {
  workspace_id: string;
  created_by: string;
  title: string;
  description?: string | null;
  location?: string | null;
  event_date: string;
  event_time: string;
  min_attendees?: number;
  max_attendees?: number | null;
  category?: string;
  is_anonymous?: boolean;
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: EventInsert) => {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create event");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.events(data.workspace_id),
      });
    },
  });
}
