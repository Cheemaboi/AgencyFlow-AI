import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeThemePreference } from "@/lib/theme";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SettingsData = {
  organization: {
    brandTagline: string;
    name: string;
  };
  profile: {
    email: string;
    emailNotifications: boolean;
    fullName: string;
    jobTitle: string;
    themePreference: "light" | "dark";
  };
};

export async function getSettingsData(): Promise<SettingsData | null> {
  if (!hasSupabaseEnv) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("organization_members")
    .select(
      `
        role,
        organizations (
          name,
          brand_tagline
        ),
        profiles!inner (
          full_name,
          job_title,
          theme_preference,
          email_notifications,
          auth_user_id
        )
      `,
    )
    .eq("profiles.auth_user_id", user.id)
    .limit(1)
    .maybeSingle();

  const organization = Array.isArray(data?.organizations)
    ? data.organizations[0]
    : data?.organizations;
  const profile = Array.isArray(data?.profiles) ? data.profiles[0] : data?.profiles;

  if (error || !organization || !profile) {
    return {
      organization: {
        brandTagline: "",
        name: user.user_metadata?.organization_name ?? "AgencyFlow AI",
      },
      profile: {
        email: user.email ?? "",
        emailNotifications: true,
        fullName:
          user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Agency owner",
        jobTitle: user.user_metadata?.role_title ?? "",
        themePreference: "light",
      },
    };
  }

  return {
    organization: {
      brandTagline: organization.brand_tagline ?? "",
      name: organization.name,
    },
    profile: {
      email: user.email ?? "",
      emailNotifications: profile.email_notifications ?? true,
      fullName: profile.full_name ?? user.email?.split("@")[0] ?? "",
      jobTitle: profile.job_title ?? "",
      themePreference: normalizeThemePreference(profile.theme_preference),
    },
  };
}
