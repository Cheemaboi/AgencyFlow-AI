"use server";

import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { buildRedirectUrl, sanitizeRedirectPath } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const redirectTo = sanitizeRedirectPath(getString(formData, "redirectTo"));

  if (!hasSupabaseEnv) {
    redirect(
      buildRedirectUrl("/login", {
        redirectTo,
        error: "Add Supabase environment variables before using real auth.",
      }),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      buildRedirectUrl("/login", {
        redirectTo,
        error: error.message,
      }),
    );
  }

  redirect(redirectTo);
}

export async function signupAction(formData: FormData) {
  const agencyName = getString(formData, "agencyName");
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  if (!hasSupabaseEnv) {
    redirect(
      buildRedirectUrl("/signup", {
        error: "Add Supabase environment variables before creating accounts.",
      }),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: agencyName,
        organization_name: agencyName,
      },
    },
  });

  if (error) {
    redirect(
      buildRedirectUrl("/signup", {
        error: error.message,
      }),
    );
  }

  if (data.session) {
    redirect("/app");
  }

  redirect(
    buildRedirectUrl("/login", {
      message: "Check your email to confirm your account, then sign in.",
    }),
  );
}

export async function logoutAction() {
  if (hasSupabaseEnv) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect(
    buildRedirectUrl("/login", {
      message: "You have been signed out.",
    }),
  );
}
