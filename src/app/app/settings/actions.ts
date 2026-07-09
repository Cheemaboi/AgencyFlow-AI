"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { buildRedirectUrl } from "@/lib/auth/redirects";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { THEME_COOKIE_NAME, normalizeThemePreference } from "@/lib/theme";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(message: string): never {
  redirect(
    buildRedirectUrl("/app/settings", {
      message,
    }),
  );
}

function redirectWithError(error: string): never {
  redirect(
    buildRedirectUrl("/app/settings", {
      error,
    }),
  );
}

export async function updateProfileSettingsAction(formData: FormData) {
  const user = await requireAuthenticatedUser("/app/settings");
  const fullName = getString(formData, "fullName");
  const jobTitle = getString(formData, "jobTitle");
  const emailNotifications = getString(formData, "emailNotifications") === "on";

  if (!hasSupabaseEnv) {
    redirectWithError("Add Supabase environment variables before saving settings.");
  }

  if (!fullName) {
    redirectWithError("Full name is required.");
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      email_notifications: emailNotifications,
      full_name: fullName,
      job_title: jobTitle || null,
    })
    .eq("auth_user_id", user.id);

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  redirectWithMessage("Profile settings saved.");
}

export async function updateOrganizationSettingsAction(formData: FormData) {
  await requireAuthenticatedUser("/app/settings");
  const organizationName = getString(formData, "organizationName");
  const brandTagline = getString(formData, "brandTagline");

  if (!hasSupabaseEnv) {
    redirectWithError("Add Supabase environment variables before saving settings.");
  }

  if (!organizationName) {
    redirectWithError("Organization name is required.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = createSupabaseAdminClient();

  const { data: membership, error: membershipError } = await admin
    .from("organization_members")
    .select("organization_id, profiles!inner(auth_user_id)")
    .eq("profiles.auth_user_id", user?.id ?? "")
    .limit(1)
    .maybeSingle();

  const membershipProfile = Array.isArray(membership?.profiles)
    ? membership.profiles[0]
    : membership?.profiles;

  if (membershipError || !membership || !membershipProfile) {
    redirectWithError("Could not resolve your organization membership.");
  }

  const organizationId = membership.organization_id;

  const { error } = await admin
    .from("organizations")
    .update({
      brand_tagline: brandTagline || null,
      name: organizationName,
    })
    .eq("id", organizationId);

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  redirectWithMessage("Organization settings saved.");
}

export async function updateAppearanceSettingsAction(formData: FormData) {
  const user = await requireAuthenticatedUser("/app/settings");
  const themePreference = normalizeThemePreference(getString(formData, "themePreference"));

  if (!hasSupabaseEnv) {
    redirectWithError("Add Supabase environment variables before saving settings.");
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      theme_preference: themePreference,
    })
    .eq("auth_user_id", user.id);

  if (error) {
    redirectWithError(error.message);
  }

  const cookieStore = await cookies();
  cookieStore.set(THEME_COOKIE_NAME, themePreference, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  revalidatePath("/app");
  revalidatePath("/app/settings");
  redirectWithMessage("Appearance settings saved.");
}
