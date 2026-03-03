import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recomputeEventStatus } from "@/lib/event-status";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  if (event.createdBy !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: body.title ?? event.title,
        description: body.description ?? null,
        location: body.location ?? null,
        eventDate: body.event_date ?? event.eventDate,
        eventTime: body.event_time ?? event.eventTime,
        minAttendees: body.min_attendees ?? event.minAttendees,
        maxAttendees: body.max_attendees ?? null,
        category: body.category ?? event.category,
        isAnonymous: body.is_anonymous ?? event.isAnonymous,
      },
    });
    await recomputeEventStatus(eventId);
    return NextResponse.json({ id: updated.id });
  } catch (err) {
    console.error("[edit event]", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      creator: { include: { profile: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Verify membership
  const membership = await prisma.membership.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: event.workspaceId,
        userId: session.userId,
      },
    },
  });
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rsvpRows = await prisma.rsvp.findMany({
    where: { eventId },
    include: {
      user: { include: { profile: true } },
    },
  });

  const rsvps = rsvpRows.map((r) => ({
    id: r.id,
    event_id: r.eventId,
    user_id: r.userId,
    status: r.status,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
    profiles: r.user.profile
      ? {
          id: r.user.id,
          full_name: r.user.profile.fullName,
          avatar_url: r.user.profile.avatarUrl,
        }
      : null,
  }));

  return NextResponse.json({
    event: {
      id: event.id,
      workspace_id: event.workspaceId,
      created_by: event.createdBy,
      title: event.title,
      description: event.description,
      location: event.location,
      event_date: event.eventDate,
      event_time: event.eventTime,
      min_attendees: event.minAttendees,
      max_attendees: event.maxAttendees,
      status: event.status,
      category: event.category,
      is_anonymous: event.isAnonymous,
      created_at: event.createdAt.toISOString(),
      updated_at: event.updatedAt.toISOString(),
      profiles: event.creator.profile
        ? {
            full_name: event.creator.profile.fullName,
            avatar_url: event.creator.profile.avatarUrl,
          }
        : null,
    },
    rsvps,
  });
}
