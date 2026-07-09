"use server";

import { redirect } from "next/navigation";
import { getAppBaseUrl } from "@/lib/auth/base-url";
import { hasSupabaseEnv } from "@/lib/env";
import { buildRedirectUrl, sanitizeRedirectPath } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error && typeof error === "object") {
    const errorRecord = error as Record<string, unknown>;
    const candidateKeys = ["message", "error_description", "code"] as const;

    for (const key of candidateKeys) {
      const value = errorRecord[key];
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  return fallback;
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
  let loginError: string | null = null;

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      loginError = getAuthErrorMessage(error, "We couldn't sign you in with those credentials.");
    }
  } catch (error) {
    loginError = getAuthErrorMessage(
      error,
      "We couldn't sign you in right now. Please try again in a moment.",
    );
  }

  if (loginError) {
    redirect(
      buildRedirectUrl("/login", {
        redirectTo,
        error: loginError,
      }),
    );
  }

  redirect(redirectTo);
}

export async function signupAction(formData: FormData) {
  const fullName = getString(formData, "fullName");
  const agencyName = getString(formData, "agencyName");
  const roleTitle = getString(formData, "roleTitle");
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const confirmPassword = getString(formData, "confirmPassword");
  const appBaseUrl = await getAppBaseUrl();

  if (!fullName || !agencyName || !email || !password) {
    redirect(
      buildRedirectUrl("/signup", {
        error: "Complete every required signup field before continuing.",
      }),
    );
  }

  if (password.length < 8) {
    redirect(
      buildRedirectUrl("/signup", {
        error: "Use a password with at least 8 characters.",
      }),
    );
  }

  if (password !== confirmPassword) {
    redirect(
      buildRedirectUrl("/signup", {
        error: "Passwords do not match.",
      }),
    );
  }

  if (!hasSupabaseEnv) {
    redirect(
      buildRedirectUrl("/signup", {
        error: "Add Supabase environment variables before creating accounts.",
      }),
    );
  }

  const supabase = await createSupabaseServerClient();
  let signUpData:
    | Awaited<ReturnType<typeof supabase.auth.signUp>>["data"]
    | null = null;
  let signUpError: string | null = null;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${appBaseUrl}/auth/confirm?next=/app`,
        data: {
          full_name: fullName,
          organization_name: agencyName,
          role_title: roleTitle,
        },
      },
    });

    signUpData = data;
    if (error) {
      signUpError = getAuthErrorMessage(
        error,
        "We couldn't create your account. Please try again.",
      );
    }
  } catch (error) {
    signUpError = getAuthErrorMessage(
      error,
      "We couldn't create your account right now. Please try again in a moment.",
    );
  }

  if (signUpError) {
    redirect(
      buildRedirectUrl("/signup", {
        error: signUpError,
      }),
    );
  }

  if (signUpData?.session) {
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

export async function requestPasswordResetAction(formData: FormData) {
  const email = getString(formData, "email");
  const appBaseUrl = await getAppBaseUrl();

  if (!hasSupabaseEnv) {
    redirect(
      buildRedirectUrl("/forgot-password", {
        error: "Add Supabase environment variables before requesting password resets.",
      }),
    );
  }

  const supabase = await createSupabaseServerClient();
  let resetError: string | null = null;

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appBaseUrl}/auth/confirm?next=/auth/reset-password`,
    });

    if (error) {
      resetError = getAuthErrorMessage(
        error,
        "We couldn't send a password reset email right now.",
      );
    }
  } catch (error) {
    resetError = getAuthErrorMessage(
      error,
      "We couldn't send a password reset email right now.",
    );
  }

  if (resetError) {
    redirect(
      buildRedirectUrl("/forgot-password", {
        error: resetError,
      }),
    );
  }

  redirect(
    buildRedirectUrl("/forgot-password", {
      message: "Check your email for a password reset link.",
    }),
  );
}

export async function updatePasswordAction(formData: FormData) {
  const password = getString(formData, "password");
  const confirmPassword = getString(formData, "confirmPassword");

  if (password !== confirmPassword) {
    redirect(
      buildRedirectUrl("/auth/reset-password", {
        error: "Passwords do not match.",
      }),
    );
  }

  if (!hasSupabaseEnv) {
    redirect(
      buildRedirectUrl("/auth/reset-password", {
        error: "Add Supabase environment variables before updating passwords.",
      }),
    );
  }

  const supabase = await createSupabaseServerClient();
  let updateError: string | null = null;

  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      updateError = getAuthErrorMessage(
        error,
        "We couldn't update your password right now.",
      );
    }
  } catch (error) {
    updateError = getAuthErrorMessage(
      error,
      "We couldn't update your password right now.",
    );
  }

  if (updateError) {
    redirect(
      buildRedirectUrl("/auth/reset-password", {
        error: updateError,
      }),
    );
  }

  redirect("/app");
}
