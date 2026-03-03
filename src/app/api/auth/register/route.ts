import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: { fullName },
        },
      },
    });

    // Auto-join all default workspaces
    const defaultWorkspaces = await prisma.workspace.findMany({
      where: { isDefault: true },
    });
    if (defaultWorkspaces.length > 0) {
      await prisma.membership.createMany({
        data: defaultWorkspaces.map((ws) => ({
          workspaceId: ws.id,
          userId: user.id,
          role: "member",
        })),
      });
    }

    await setSessionCookie({ userId: user.id, email: user.email });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
