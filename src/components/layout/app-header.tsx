"use client";

import { Logo } from "./logo";
import { UserMenu } from "./user-menu";
import { WorkspaceSelector } from "@/components/workspace/workspace-selector";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { WorkspaceMembersDialog } from "@/components/workspace/workspace-members";
import { useWorkspaceContext } from "@/providers/workspace-provider";
import type { Profile } from "@/lib/types/database.types";

export function AppHeader({
  userId,
  profile,
}: {
  userId: string;
  profile: Profile | null | undefined;
}) {
  const { activeWorkspace } = useWorkspaceContext();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 mx-auto max-w-3xl">
        <div className="flex items-center gap-4">
          <Logo />
          <WorkspaceSelector userId={userId} />
          <CreateWorkspaceDialog userId={userId} />
          {activeWorkspace && (
            <WorkspaceMembersDialog
              workspaceId={activeWorkspace.id}
              workspaceName={activeWorkspace.name}
              userId={userId}
            />
          )}
        </div>
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}
