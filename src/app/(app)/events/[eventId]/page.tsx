"use client";

import { useParams } from "next/navigation";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { EventDetail } from "@/components/events/event-detail";
import { PageContainer } from "@/components/shared/page-container";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { activeWorkspace } = useCurrentWorkspace();

  return (
    <PageContainer>
      <EventDetail eventId={eventId} workspaceId={activeWorkspace?.id ?? ""} />
    </PageContainer>
  );
}
