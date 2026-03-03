export const queryKeys = {
  allUsers: () => ["all-users"] as const,
  profile: (userId: string) => ["profile", userId] as const,
  workspaces: (userId: string) => ["workspaces", userId] as const,
  workspace: (workspaceId: string) => ["workspace", workspaceId] as const,
  events: (workspaceId: string) => ["events", workspaceId] as const,
  event: (eventId: string) => ["event", eventId] as const,
  eventRsvps: (eventId: string) => ["event-rsvps", eventId] as const,
  workspaceMembers: (workspaceId: string) => ["workspace-members", workspaceId] as const,
  workspaceStats: (workspaceId: string) => ["workspace-stats", workspaceId] as const,
};
