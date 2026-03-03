import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await prisma.membership.findMany({
    where: { userId: session.userId },
    include: { workspace: true },
  });

  const workspaces = memberships.map((m) => m.workspace);
  return NextResponse.json(workspaces);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, memberIds } = await request.json();
    if (!name) {
      return NextResponse.json(
        { error: "Workspace name is required" },
        { status: 400 }
      );
    }

    const inviteCode = randomBytes(4).toString("hex");

    const extraMembers: string[] = Array.isArray(memberIds)
      ? memberIds.filter((id: unknown) => typeof id === "string" && id !== session.userId)
      : [];

    const workspace = await prisma.workspace.create({
      data: {
        name,
        inviteCode,
        createdBy: session.userId,
        memberships: {
          create: [
            { userId: session.userId, role: "owner" },
            ...extraMembers.map((userId) => ({ userId, role: "member" })),
          ],
        },
      },
    });

    return NextResponse.json(workspace);
  } catch (err) {
    console.error("[create workspace]", err);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}
