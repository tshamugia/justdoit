import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;

  const requesterMembership = await prisma.membership.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.userId } },
  });
  if (!requesterMembership || !["owner", "admin"].includes(requesterMembership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const userIds: unknown[] = body?.userIds;
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ error: "userIds is required" }, { status: 400 });
  }

  try {
    await prisma.$transaction(
      userIds
        .filter((id): id is string => typeof id === "string")
        .map((userId) =>
          prisma.membership.upsert({
            where: { workspaceId_userId: { workspaceId, userId } },
            update: {},
            create: { workspaceId, userId, role: "member" },
          })
        )
    );
  } catch (err) {
    console.error("[add members]", err);
    return NextResponse.json({ error: "Failed to add members" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;

  // Verify requester is a member
  const requesterMembership = await prisma.membership.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.userId } },
  });
  if (!requesterMembership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const memberships = await prisma.membership.findMany({
    where: { workspaceId },
    include: { user: { include: { profile: true } } },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json(
    memberships.map((m) => ({
      id: m.id,
      user_id: m.userId,
      full_name: m.user.profile?.fullName ?? "",
      avatar_url: m.user.profile?.avatarUrl ?? null,
      role: m.role,
      joined_at: m.joinedAt.toISOString(),
    }))
  );
}
