"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";
import { Logo } from "@/components/brand/logo";
import { Input } from "@/components/ui/input";
import type { OrganizationContext } from "@/lib/data/organization";
import { appNavigation } from "@/lib/navigation";

function getInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "AF";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function formatRole(role: string) {
  return role.replace(/_/g, " ");
}

type AppShellProps = {
  children: ReactNode;
  organization: OrganizationContext | null;
};

export function AppShell({ children, organization }: AppShellProps) {
  const pathname = usePathname();
  const identityName = organization?.fullName ?? "Agency owner";
  const identityInitials = getInitials(identityName);
  const roleLabel = organization?.roleTitle ?? (organization?.role ? formatRole(organization.role) : "admin");

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1600px] items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="surface-card flex min-w-0 flex-col overflow-hidden px-4 py-5 sm:px-5">
          <div className="border-b border-[var(--border-subtle)] pb-5">
            <Logo href="/" />
          </div>
          <nav className="mt-5 flex flex-wrap gap-2 lg:flex-1 lg:flex-col">
            {appNavigation.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/app" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[var(--accent-soft)] text-[var(--accent-primary-hover)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="surface-panel mt-4 flex items-start gap-3 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent-primary-hover)]">
              {identityInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                {identityName}
              </p>
              <p className="mt-1 truncate text-xs uppercase tracking-[0.2em] text-[var(--accent-primary-hover)]">
                {roleLabel}
              </p>
              <p className="mt-2 truncate text-sm text-[var(--text-secondary)]">
                {organization?.organizationName ?? "AgencyFlow AI"}
              </p>
              <p className="mt-1 break-all text-xs leading-5 text-[var(--text-secondary)]">
                {organization?.email ?? "Connect Supabase to load account identity."}
              </p>
            </div>
          </div>
        </aside>

        <div className="surface-card flex min-w-0 flex-col">
          <header className="flex flex-col gap-4 border-b border-[var(--border-subtle)] px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 w-full xl:max-w-md">
              <Input
                ariaLabel="Search the workspace"
                placeholder={`Search ${organization?.organizationName ?? "projects"}, files, and notes`}
              />
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <div className="min-w-0 max-w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {identityName}
                </p>
                <p className="truncate text-xs text-[var(--text-secondary)]">
                  {organization?.organizationName ?? "AgencyFlow AI"}
                </p>
              </div>
              <span className="pill pill-accent">{roleLabel}</span>
              <form action={logoutAction}>
                <button className="pill pill-muted transition-colors hover:bg-[var(--bg-surface-alt)]">
                  Sign out
                </button>
              </form>
            </div>
          </header>
          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
