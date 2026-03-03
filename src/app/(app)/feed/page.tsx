"use client";

import { useEffect, useState } from "react";
import { useEvents } from "@/hooks/use-events";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { EventList } from "@/components/events/event-list";
import { WorkspaceStats } from "@/components/workspace/workspace-stats";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function FeedPage() {
  const { activeWorkspace } = useCurrentWorkspace();
  const { data: events, isLoading } = useEvents(activeWorkspace?.id);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) setUserId(data.id);
      })
      .catch(() => {});
  }, []);

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button asChild size="sm" className="hidden md:flex">
          <Link href="/events/create">
            <Plus className="mr-1 h-4 w-4" /> Create Event
          </Link>
        </Button>
      </div>
      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-6">
        <EventList
          events={events}
          isLoading={isLoading}
          userId={userId}
          workspaceId={activeWorkspace?.id ?? ""}
        />
        <aside className="hidden lg:block">
          <WorkspaceStats workspaceId={activeWorkspace?.id} />
        </aside>
      </div>
    </PageContainer>
  );
}
