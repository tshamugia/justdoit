import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface PartyLeader {
  userId: string;
  name: string;
  avatarUrl: string | null;
  eventCount: number;
}

interface TopMember {
  userId: string;
  name: string;
  avatarUrl: string | null;
  points: number;
}

export interface WorkspaceStats {
  partyLeader: PartyLeader | null;
  thisWeekGatherings: number;
  lastWeekGatherings: number;
  topMembers: TopMember[];
}

export function useWorkspaceStats(workspaceId?: string) {
  return useQuery<WorkspaceStats>({
    queryKey: queryKeys.workspaceStats(workspaceId!),
    queryFn: () =>
      fetch(`/api/workspaces/${workspaceId}/stats`).then((r) => r.json()),
    enabled: !!workspaceId,
  });
}
