import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { buildRedirectUrl } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  if (!hasSupabaseEnv) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireAuthenticatedUser(redirectTo = "/app") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(
      buildRedirectUrl("/login", {
        redirectTo,
        error: "Please sign in to access the app.",
      }),
    );
  }

  return user;
}
