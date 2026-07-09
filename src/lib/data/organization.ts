import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type OrganizationContext = {
  avatarUrl: string | null;
  email: string;
  fullName: string;
  membershipId: string;
  organizationId: string;
  organizationName: string;
  profileId: string;
  role: string;
  roleTitle: string | null;
};

function firstRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export async function getCurrentOrganizationContext() {
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
        id,
        role,
        profile_id,
        organization_id,
        organizations (
          id,
          name
        ),
        profiles!inner (
          auth_user_id,
          full_name,
          avatar_url,
          job_title
        )
      `,
    )
    .eq("profiles.auth_user_id", user.id)
    .limit(1)
    .maybeSingle();

  const organization = firstRelation(data?.organizations);
  const profile = firstRelation(data?.profiles);

  if (error || !data || !organization || !profile) {
    return {
      avatarUrl: null,
      email: user.email ?? "",
      fullName: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Agency owner",
      membershipId: "",
      organizationId: "",
      organizationName: user.user_metadata?.organization_name ?? "AgencyFlow AI",
      profileId: "",
      role: "admin",
      roleTitle: user.user_metadata?.role_title ?? null,
    } satisfies OrganizationContext;
  }

  return {
    avatarUrl: profile.avatar_url ?? null,
    email: user.email ?? "",
    fullName: profile.full_name ?? user.email?.split("@")[0] ?? "Agency owner",
    membershipId: data.id,
    organizationId: data.organization_id,
    organizationName: organization.name,
    profileId: data.profile_id,
    role: data.role,
    roleTitle: profile.job_title ?? user.user_metadata?.role_title ?? null,
  } satisfies OrganizationContext;
}
