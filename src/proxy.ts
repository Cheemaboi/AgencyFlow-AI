import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env, hasSupabaseEnv } from "@/lib/env";
import { isProtectedPath } from "@/lib/auth/route-access";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    !isProtectedPath(pathname) ||
    !hasSupabaseEnv ||
    !env.NEXT_PUBLIC_ENABLE_AUTH_GUARDS
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createSupabaseRouteClient(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return response;
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/app/:path*"],
};
