import { generateWorkspaceUpdateAction } from "@/app/app/ai/actions";
import { notFound } from "next/navigation";
import { createApprovalRequestAction, createTaskAction } from "@/app/app/workspaces/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SidePanel } from "@/components/ui/side-panel";
import { SubmitButton } from "@/components/ui/submit-button";
import { Tabs } from "@/components/ui/tabs";
import { getWorkspaceDetailData } from "@/lib/data/workspaces";

type WorkspacePageProps = {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function WorkspaceDetailPage({ params, searchParams }: WorkspacePageProps) {
  const [{ workspaceId }, { error, message }] = await Promise.all([params, searchParams]);
  const data = await getWorkspaceDetailData(workspaceId);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace detail"
        title={data.workspace.name}
        description={
          data.usingFallback
            ? "This workspace is still showing polished fallback content while the real record set fills in."
            : "This workspace now mixes live project structure, milestones, files, approvals, and protected org-scoped data."
        }
        badgeLabel={data.workspace.stage}
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

      <Tabs items={["Overview", "Tasks", "Files", "Feedback", "Approvals", "Settings"]} />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr_0.7fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Milestone timeline</h2>
          <div className="mt-5 space-y-3">
            {data.workspaceMilestones.map((item, index) => (
              <div key={`${item.name}-${item.due}-${index}`} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.name}</p>
                  <span className="pill pill-muted">{item.status}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Due {item.due}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Task checklist</h2>
          <div className="mt-5 space-y-3">
            {data.workspaceTasks.map((task, index) => (
              <div key={`${task.title}-${task.state}-${index}`} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{task.title}</p>
                  <span className="pill pill-accent">{task.state}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{task.assignee}</p>
              </div>
            ))}
          </div>
          <form action={createTaskAction.bind(null, workspaceId)} className="mt-5 space-y-3 border-t border-[var(--border-subtle)] pt-5">
            <Input label="Add task" name="title" placeholder="Prepare mobile review bundle" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">State</span>
                <select
                  className="h-12 w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)]"
                  defaultValue="todo"
                  name="state"
                >
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="ready">Ready</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </select>
              </label>
              <Input label="Due date" name="dueDate" type="date" />
            </div>
            <Button type="submit" variant="secondary">
              Add task
            </Button>
          </form>
        </Card>

        <SidePanel
          title="AI copilot"
          description="Project-aware suggestions and summary prompts now have a dedicated visual home."
        >
          <form action={generateWorkspaceUpdateAction.bind(null, workspaceId)} className="space-y-3">
            <SubmitButton className="w-full" pendingLabel="Generating update...">
              Generate client update
            </SubmitButton>
          </form>
        </SidePanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Deliverables and files</h2>
          <div className="mt-5 space-y-3">
            {data.workspaceDeliverables.map((item, index) => (
              <div key={`${item.name}-${item.status}-${index}`} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.name}</p>
                  <span className="pill pill-muted">{item.status}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.type}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Feedback and approvals</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              {data.workspaceFeedback.map((item, index) => (
                <div key={`${item.author}-${item.comment}-${index}`} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                  <p className="font-semibold">{item.author}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-primary-hover)]">
                    {item.role}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                    {item.comment}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {data.workspaceApprovals.map((item, index) => (
                <div key={`${item.item}-${item.state}-${index}`} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                  <p className="font-semibold">{item.item}</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    Reviewers: {item.reviewers}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-primary-hover)]">
                    {item.state}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <form action={createApprovalRequestAction.bind(null, workspaceId)} className="mt-5 space-y-3 border-t border-[var(--border-subtle)] pt-5">
            <Input label="Request approval for" name="title" placeholder="Homepage v5" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">State</span>
                <select
                  className="h-12 w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)]"
                  defaultValue="pending_review"
                  name="state"
                >
                  <option value="pending_review">Pending review</option>
                  <option value="needs_changes">Needs changes</option>
                  <option value="approved">Approved</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <Input label="Due date" name="dueDate" type="date" />
            </div>
            <Button type="submit" variant="secondary">
              Create approval request
            </Button>
          </form>
        </Card>
      </section>

      <Card className="p-6">
        <h2 className="text-xl font-semibold tracking-[-0.03em]">AI workspace copilot notes</h2>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {data.workspaceAiCopilot.map((item, index) => (
            <div key={`workspace-copilot-${index}`} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
              <p className="text-sm leading-7 text-[var(--text-secondary)]">{item}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
