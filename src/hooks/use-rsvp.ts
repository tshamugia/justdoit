"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { RsvpStatus, EventWithCounts } from "@/lib/types/database.types";

export function useRsvp(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  const upsertRsvp = useMutation({
    mutationFn: async ({
      eventId,
      status,
    }: {
      eventId: string;
      userId: string;
      status: RsvpStatus;
    }) => {
      const res = await fetch(`/api/events/${eventId}/rsvps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update RSVP");
      return res.json();
    },
    onMutate: async ({ eventId, status }) => {
      const key = queryKeys.events(workspaceId ?? "");
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<EventWithCounts[]>(key);
      if (previous) {
        queryClient.setQueryData<EventWithCounts[]>(key, (prev) =>
          prev?.map((e) => {
            if (e.id !== eventId) return e;
            const wasIn = e.current_user_rsvp === "in";
            const wasMaybe = e.current_user_rsvp === "maybe";
            return {
              ...e,
              current_user_rsvp: status,
              in_count:
                status === "in"
                  ? wasIn
                    ? e.in_count
                    : e.in_count + 1
                  : wasIn
                    ? e.in_count - 1
                    : e.in_count,
              maybe_count:
                status === "maybe"
                  ? wasMaybe
                    ? e.maybe_count
                    : e.maybe_count + 1
                  : wasMaybe
                    ? e.maybe_count - 1
                    : e.maybe_count,
            };
          })
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.events(workspaceId ?? ""),
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.events(workspaceId ?? ""),
      });
    },
  });

  const withdrawRsvp = useMutation({
    mutationFn: async ({
      eventId,
    }: {
      eventId: string;
      userId: string;
    }) => {
      const res = await fetch(`/api/events/${eventId}/rsvps`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to withdraw RSVP");
    },
    onMutate: async ({ eventId }) => {
      const key = queryKeys.events(workspaceId ?? "");
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<EventWithCounts[]>(key);
      if (previous) {
        queryClient.setQueryData<EventWithCounts[]>(key, (prev) =>
          prev?.map((e) => {
            if (e.id !== eventId) return e;
            return {
              ...e,
              in_count:
                e.current_user_rsvp === "in" ? e.in_count - 1 : e.in_count,
              maybe_count:
                e.current_user_rsvp === "maybe"
                  ? e.maybe_count - 1
                  : e.maybe_count,
              current_user_rsvp: null,
            };
          })
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.events(workspaceId ?? ""),
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.events(workspaceId ?? ""),
      });
    },
  });

  return { upsertRsvp, withdrawRsvp };
}
