import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { id: { not: session.userId } },
    select: {
      id: true,
      profile: { select: { fullName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const result = users.map((u) => ({
    id: u.id,
    full_name: u.profile?.fullName ?? "",
    avatar_url: u.profile?.avatarUrl ?? null,
  }));

  return NextResponse.json(result);
}
