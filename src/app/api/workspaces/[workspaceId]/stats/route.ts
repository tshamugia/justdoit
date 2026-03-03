import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  format,
} from "date-fns";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;

  const membership = await prisma.membership.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.userId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Party leader: member who created the most events in this workspace
  const events = await prisma.event.findMany({
    where: { workspaceId },
    select: { createdBy: true },
  });

  const countByCreator: Record<string, number> = {};
  for (const e of events) {
    countByCreator[e.createdBy] = (countByCreator[e.createdBy] ?? 0) + 1;
  }

  let partyLeader = null;
  if (Object.keys(countByCreator).length > 0) {
    const topCreatorId = Object.entries(countByCreator).sort(
      ([, a], [, b]) => b - a
    )[0][0];
    const topCreatorProfile = await prisma.profile.findUnique({
      where: { id: topCreatorId },
    });
    partyLeader = {
      userId: topCreatorId,
      name: topCreatorProfile?.fullName ?? "Unknown",
      avatarUrl: topCreatorProfile?.avatarUrl ?? null,
      eventCount: countByCreator[topCreatorId],
    };
  }

  // Weekly gatherings
  const now = new Date();
  const thisWeekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const thisWeekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const lastWeekStart = format(startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const lastWeekEnd = format(endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const thisWeekGatherings = await prisma.event.count({
    where: {
      workspaceId,
      status: "happening",
      eventDate: { gte: thisWeekStart, lte: thisWeekEnd },
    },
  });

  const lastWeekGatherings = await prisma.event.count({
    where: {
      workspaceId,
      status: "happening",
      eventDate: { gte: lastWeekStart, lte: lastWeekEnd },
    },
  });

  // Top members by points
  const memberships = await prisma.membership.findMany({
    where: { workspaceId },
    include: { user: { include: { profile: true } } },
  });

  const topMembers = memberships
    .map((m) => ({
      userId: m.userId,
      name: m.user.profile?.fullName ?? "Unknown",
      avatarUrl: m.user.profile?.avatarUrl ?? null,
      points: m.user.profile?.points ?? 0,
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  return NextResponse.json({
    partyLeader,
    thisWeekGatherings,
    lastWeekGatherings,
    topMembers,
  });
}
