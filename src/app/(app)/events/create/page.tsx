export const dynamic = "force-dynamic";

import { CreateEventForm } from "@/components/events/create-event-form";
import { PageContainer } from "@/components/shared/page-container";

export default function CreateEventPage() {
  return (
    <PageContainer className="flex justify-center">
      <CreateEventForm />
    </PageContainer>
  );
}
