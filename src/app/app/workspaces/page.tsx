import Link from "next/link";
import { createWorkspaceAction } from "@/app/app/workspaces/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { getWorkspaceDirectoryData } from "@/lib/data/workspaces";

type WorkspacesPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function WorkspacesPage({ searchParams }: WorkspacesPageProps) {
  const { error, message } = await searchParams;
  const data = await getWorkspaceDirectoryData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspaces"
        title="Client workspaces are now designed as full operational hubs"
        description={
          data.usingFallback
            ? "This directory is still showing designed fallback cards until real workspace records are available."
            : "This directory now reflects real organization workspaces from Supabase-backed data."
        }
      />

      {message ? (
        <p className="rounded-[18px] border border-[rgba(31,169,113,0.18)] bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--accent-primary-hover)]">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-[18px] border border-[rgba(239,107,107,0.28)] bg-[rgba(239,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        {data.stats.map((stat, index) => (
          <Card key={`${stat.label}-${stat.value}-${index}`} className="p-6">
            <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{stat.value}</p>
          </Card>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[0.92fr_minmax(0,1.08fr)]">
        <Card className="p-6">
          <p className="section-kicker">Create workspace</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Launch a client workspace</h2>
          <form action={createWorkspaceAction} className="mt-5 space-y-4">
            <Input label="Workspace name" name="name" placeholder="Northshore Launch Workspace" required />
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">Project</span>
              <select
                className="h-12 w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)]"
                defaultValue=""
                name="projectId"
                required
              >
                <option value="" disabled>
                  {data.projectOptions.length > 0 ? "Select a project" : "Create a project first"}
                </option>
                {data.projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">Stage</span>
              <select
                className="h-12 w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)]"
                defaultValue="backlog"
                name="stage"
              >
                <option value="backlog">Backlog</option>
                <option value="in_progress">In progress</option>
                <option value="review">Review</option>
                <option value="approved">Approved</option>
                <option value="delivered">Delivered</option>
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">Summary</span>
              <textarea
                className="min-h-28 w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-primary)]"
                name="summary"
                placeholder="Shared overview, files, approvals, tasks, and communication notes."
              />
            </label>
            <Button className="w-full" disabled={data.projectOptions.length === 0} type="submit">
              Save workspace
            </Button>
          </form>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="section-kicker">Workspace directory</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                Existing workspaces
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Scroll through live client hubs
            </p>
          </div>
          <div className="mt-5 max-h-[44rem] space-y-4 overflow-y-auto pr-2">
            {data.workspaces.map((workspace) => (
              <Link key={workspace.id} href={`/app/workspaces/${workspace.id}`}>
                <Card className="p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:border-[rgba(31,169,113,0.24)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="[overflow-wrap:normal] text-xl font-semibold leading-8 tracking-[-0.03em] break-words">
                        {workspace.name}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
                        {workspace.client}
                      </p>
                    </div>
                    <StatusPill status={workspace.stage}>{workspace.stage}</StatusPill>
                  </div>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
                    {workspace.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-secondary)]">
                    <span>Overview, files, approvals</span>
                    <span className="font-semibold text-[var(--accent-primary-hover)]">
                      Open workspace
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
