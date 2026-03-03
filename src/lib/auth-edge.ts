import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

export const COOKIE_NAME = "session";

const getSecret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET ?? "dev-secret-change-in-production"
  );

export interface SessionPayload {
  userId: string;
  email: string;
}

export async function verifyToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(
  request: NextRequest
): Promise<SessionPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
