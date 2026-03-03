"use client";

import { useWorkspaceContext } from "@/providers/workspace-provider";
import { useWorkspaces } from "@/hooks/use-workspace";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function WorkspaceSelector({ userId }: { userId: string }) {
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceContext();
  const { data: workspaces, isLoading } = useWorkspaces(userId);

  const handleChange = (workspaceId: string) => {
    const ws = workspaces?.find((w) => w.id === workspaceId);
    if (ws) setActiveWorkspace(ws);
  };

  if (isLoading) {
    return <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />;
  }

  if (!workspaces?.length) {
    return (
      <span className="text-sm text-muted-foreground">No workspaces</span>
    );
  }

  return (
    <Select value={activeWorkspace?.id ?? ""} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px] h-9">
        <SelectValue placeholder="Select workspace" />
      </SelectTrigger>
      <SelectContent>
        {workspaces.map((ws) => (
          <SelectItem key={ws.id} value={ws.id}>
            {ws.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
