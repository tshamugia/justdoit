"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export function useJoinWorkspace(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      const res = await fetch("/api/workspaces/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to join workspace");
      }
      const data = await res.json();
      return data.workspaceId as string;
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspaces(userId),
        });
      }
    },
  });
}
