import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type OrganizationContext = {
  membershipId: string;
  organizationId: string;
  organizationName: string;
  profileId: string;
  role: string;
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

  const { data, error } = await supabase
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
          auth_user_id
        )
      `,
    )
    .eq("profiles.auth_user_id", user.id)
    .limit(1)
    .maybeSingle();

  const organization = firstRelation(data?.organizations);

  if (error || !data || !organization) {
    return null;
  }

  return {
    membershipId: data.id,
    organizationId: data.organization_id,
    organizationName: organization.name,
    profileId: data.profile_id,
    role: data.role,
  } satisfies OrganizationContext;
}
