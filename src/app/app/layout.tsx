import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getCurrentOrganizationContext } from "@/lib/data/organization";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  await requireAuthenticatedUser("/app");
  const organization = await getCurrentOrganizationContext();

  return <AppShell organization={organization}>{children}</AppShell>;
}
