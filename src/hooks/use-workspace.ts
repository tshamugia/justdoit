"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Workspace } from "@/lib/types/database.types";

export function useWorkspaces(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workspaces(userId ?? ""),
    queryFn: async (): Promise<Workspace[]> => {
      const res = await fetch("/api/workspaces");
      if (!res.ok) throw new Error("Failed to fetch workspaces");
      const data = await res.json();
      return data.map((w: any) => ({
        id: w.id,
        name: w.name,
        invite_code: w.inviteCode,
        created_by: w.createdBy,
        created_at: w.createdAt,
        is_default: w.isDefault ?? false,
      }));
    },
    enabled: !!userId,
  });
}
