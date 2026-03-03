import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json(
      { error: "workspaceId is required" },
      { status: 400 }
    );
  }

  // Verify membership
  const membership = await prisma.membership.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId: session.userId },
    },
  });
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const events = await prisma.event.findMany({
    where: { workspaceId },
    include: {
      creator: { include: { profile: true } },
      rsvps: true,
    },
    orderBy: [{ eventDate: "asc" }, { eventTime: "asc" }],
  });

  const result = events.map((event) => {
    const inCount = event.rsvps.filter((r) => r.status === "in").length;
    const maybeCount = event.rsvps.filter((r) => r.status === "maybe").length;
    const currentUserRsvp =
      event.rsvps.find((r) => r.userId === session.userId)?.status ?? null;

    return {
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
      in_count: inCount,
      maybe_count: maybeCount,
      current_user_rsvp: currentUserRsvp,
      creator_name: event.creator.profile?.fullName ?? "",
      creator_avatar: event.creator.profile?.avatarUrl ?? null,
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      workspace_id,
      title,
      description,
      location,
      event_date,
      event_time,
      min_attendees,
      max_attendees,
      category,
      is_anonymous,
    } = body;

    // Verify membership
    const membership = await prisma.membership.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspace_id,
          userId: session.userId,
        },
      },
    });
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const event = await prisma.event.create({
      data: {
        workspaceId: workspace_id,
        createdBy: session.userId,
        title,
        description: description ?? null,
        location: location ?? null,
        eventDate: event_date,
        eventTime: event_time,
        minAttendees: min_attendees ?? 2,
        maxAttendees: max_attendees ?? null,
        category: category ?? "other",
        isAnonymous: is_anonymous ?? false,
      },
    });

    await prisma.profile.update({
      where: { id: session.userId },
      data: { points: { increment: 10 } },
    });

    return NextResponse.json({
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
    });
  } catch (err) {
    console.error("[create event]", err);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
