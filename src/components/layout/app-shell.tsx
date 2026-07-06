"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Input } from "@/components/ui/input";
import { appNavigation } from "@/lib/navigation";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1600px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="surface-card order-2 flex flex-col overflow-hidden px-4 py-5 sm:px-5 lg:order-1">
          <div className="border-b border-[var(--border-subtle)] pb-5">
            <Logo href="/" />
          </div>
          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {appNavigation.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/app" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-[18px] px-4 py-3 text-sm font-semibold transition-colors ${
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
          <div className="surface-panel mt-4 p-4">
            <p className="text-sm font-semibold tracking-[-0.02em]">
              Auth guard plan
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              `/app` routes are ready to switch to enforced protection when Supabase auth
              is connected in Phase 3.
            </p>
          </div>
        </aside>

        <div className="surface-card order-1 flex min-w-0 flex-col lg:order-2">
          <header className="flex flex-col gap-4 border-b border-[var(--border-subtle)] px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="w-full xl:max-w-md">
              <Input
                ariaLabel="Search the workspace"
                placeholder="Search projects, clients, files, and notes"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="pill pill-muted">Vercel-ready baseline</span>
              <span className="pill pill-accent">Supabase scaffolded</span>
            </div>
          </header>
          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
