import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { inviteCode } = await request.json();
    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { inviteCode },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    await prisma.membership.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: session.userId,
        },
      },
      create: {
        workspaceId: workspace.id,
        userId: session.userId,
        role: "member",
      },
      update: {},
    });

    return NextResponse.json({ workspaceId: workspace.id });
  } catch (err) {
    console.error("[join workspace]", err);
    return NextResponse.json(
      { error: "Failed to join workspace" },
      { status: 500 }
    );
  }
}
