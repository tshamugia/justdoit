"use client";

import { useWorkspaceStats } from "@/hooks/use-workspace-stats";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkspaceStatsProps {
  workspaceId?: string;
}

export function WorkspaceStats({ workspaceId }: WorkspaceStatsProps) {
  const { data, isLoading } = useWorkspaceStats(workspaceId);

  if (!workspaceId) return null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Party Leader */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Party Leader
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.partyLeader ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <Avatar className="h-9 w-9">
                <AvatarImage src={data.partyLeader.avatarUrl ?? undefined} />
                <AvatarFallback className="text-sm">
                  {data.partyLeader.name?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{data.partyLeader.name}</p>
                <p className="text-xs text-muted-foreground">
                  {data.partyLeader.eventCount} event
                  {data.partyLeader.eventCount !== 1 ? "s" : ""} created
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No events yet</p>
          )}
        </CardContent>
      </Card>

      {/* Weekly Gatherings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Weekly Gatherings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{data.thisWeekGatherings}</span>
            <span className="text-sm text-muted-foreground">this week</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.lastWeekGatherings} last week
          </p>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      {data.topMembers.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topMembers.map((member, i) => (
              <div key={member.userId} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={member.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-[10px]">
                    {member.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm flex-1 truncate">{member.name}</span>
                <span className="text-xs font-medium text-muted-foreground">
                  {member.points} pts
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
