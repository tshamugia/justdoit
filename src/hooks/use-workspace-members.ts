"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { WorkspaceMember } from "@/lib/types/database.types";

export function useWorkspaceMembers(workspaceId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workspaceMembers(workspaceId ?? ""),
    queryFn: async (): Promise<WorkspaceMember[]> => {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`);
      if (!res.ok) throw new Error("Failed to fetch workspace members");
      return res.json();
    },
    enabled: !!workspaceId,
  });
}
