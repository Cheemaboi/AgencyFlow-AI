import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireAuthenticatedUser } from "@/lib/auth/session";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  await requireAuthenticatedUser("/app");
  return <AppShell>{children}</AppShell>;
}
