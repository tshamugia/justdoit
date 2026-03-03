import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recomputeEventStatus } from "@/lib/event-status";
import {
  calculateRsvpPointDelta,
  calculateWithdrawPointDelta,
  applyPointDelta,
} from "@/lib/points";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;
  const { status } = await request.json();

  if (status !== "in" && status !== "maybe") {
    return NextResponse.json(
      { error: "Status must be 'in' or 'maybe'" },
      { status: 400 }
    );
  }

  // Track previous RSVP status for points calculation
  const existingRsvp = await prisma.rsvp.findUnique({
    where: { eventId_userId: { eventId, userId: session.userId } },
  });
  const previousStatus = existingRsvp?.status ?? null;

  const rsvp = await prisma.rsvp.upsert({
    where: { eventId_userId: { eventId, userId: session.userId } },
    create: { eventId, userId: session.userId, status },
    update: { status },
  });

  // Award/deduct points based on RSVP change
  const delta = calculateRsvpPointDelta(status, previousStatus);
  if (delta !== 0) {
    if (delta > 0) {
      await prisma.profile.update({
        where: { id: session.userId },
        data: { points: { increment: delta } },
      });
    } else {
      const profile = await prisma.profile.findUnique({ where: { id: session.userId } });
      await prisma.profile.update({
        where: { id: session.userId },
        data: { points: applyPointDelta(profile?.points ?? 0, delta) },
      });
    }
  }

  await recomputeEventStatus(eventId);

  return NextResponse.json({
    id: rsvp.id,
    event_id: rsvp.eventId,
    user_id: rsvp.userId,
    status: rsvp.status,
    created_at: rsvp.createdAt.toISOString(),
    updated_at: rsvp.updatedAt.toISOString(),
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;

  // Track previous RSVP for points deduction
  const existingRsvp = await prisma.rsvp.findUnique({
    where: { eventId_userId: { eventId, userId: session.userId } },
  });

  await prisma.rsvp
    .delete({
      where: { eventId_userId: { eventId, userId: session.userId } },
    })
    .catch(() => null); // Ignore if not found

  // Deduct points if withdrawing an "in" RSVP
  const delta = calculateWithdrawPointDelta(existingRsvp?.status ?? null);
  if (delta !== 0) {
    const profile = await prisma.profile.findUnique({ where: { id: session.userId } });
    await prisma.profile.update({
      where: { id: session.userId },
      data: { points: applyPointDelta(profile?.points ?? 0, delta) },
    });
  }

  await recomputeEventStatus(eventId);

  return NextResponse.json({ success: true });
}
