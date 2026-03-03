import { prisma } from "@/lib/prisma";
import type { EventStatus } from "@/lib/types/database.types";

export function computeEventStatus(
  inCount: number,
  minAttendees: number,
  currentStatus: EventStatus,
  eventDate: string,
  today: string
): EventStatus {
  if (eventDate < today) return currentStatus;
  if (inCount >= minAttendees) return "happening";
  if (inCount === 0) return "pending";
  return currentStatus === "happening" || currentStatus === "at_risk"
    ? "at_risk"
    : "pending";
}

export async function recomputeEventStatus(eventId: string): Promise<void> {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return;

  const today = new Date().toISOString().split("T")[0];

  const inCount = await prisma.rsvp.count({
    where: { eventId, status: "in" },
  });

  const newStatus = computeEventStatus(
    inCount,
    event.minAttendees,
    event.status as EventStatus,
    event.eventDate,
    today
  );

  if (newStatus !== event.status) {
    await prisma.event.update({
      where: { id: eventId },
      data: { status: newStatus },
    });
  }
}
