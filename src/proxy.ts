import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env, hasSupabaseEnv } from "@/lib/env";
import { isProtectedPath } from "@/lib/auth/route-access";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    !isProtectedPath(pathname) ||
    !hasSupabaseEnv ||
    !env.NEXT_PUBLIC_ENABLE_AUTH_GUARDS
  ) {
    return NextResponse.next();
  }

  const hasSession =
    request.cookies.has("sb-access-token") || request.cookies.has("sb-refresh-token");

  if (hasSession) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/app/:path*"],
};
