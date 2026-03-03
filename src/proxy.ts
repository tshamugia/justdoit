import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth-edge";

export async function proxy(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");
  const isJoinRoute = pathname.startsWith("/join");
  const isApiRoute = pathname.startsWith("/api");

  // Let API routes pass through
  if (isApiRoute) return NextResponse.next();

  // Unauthenticated: redirect to login (except public routes)
  if (!session && !isAuthRoute && !isJoinRoute && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Authenticated: redirect away from auth routes
  if (session && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/feed";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
