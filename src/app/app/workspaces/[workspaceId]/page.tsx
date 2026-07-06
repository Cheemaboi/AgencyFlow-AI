import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { SidePanel } from "@/components/ui/side-panel";
import { Tabs } from "@/components/ui/tabs";
import { getWorkspaceDetailData } from "@/lib/data/workspaces";

type WorkspacePageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceDetailPage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
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

      <Tabs items={["Overview", "Tasks", "Files", "Feedback", "Approvals", "Settings"]} />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr_0.7fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Milestone timeline</h2>
          <div className="mt-5 space-y-3">
            {data.workspaceMilestones.map((item) => (
              <div key={item.name} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
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
            {data.workspaceTasks.map((task) => (
              <div key={task.title} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{task.title}</p>
                  <span className="pill pill-accent">{task.state}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{task.assignee}</p>
              </div>
            ))}
          </div>
        </Card>

        <SidePanel
          title="AI copilot"
          description="Project-aware suggestions and summary prompts now have a dedicated visual home."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Deliverables and files</h2>
          <div className="mt-5 space-y-3">
            {data.workspaceDeliverables.map((item) => (
              <div key={item.name} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
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
              {data.workspaceFeedback.map((item) => (
                <div key={item.comment} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
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
              {data.workspaceApprovals.map((item) => (
                <div key={item.item} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
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
        </Card>
      </section>

      <Card className="p-6">
        <h2 className="text-xl font-semibold tracking-[-0.03em]">AI workspace copilot notes</h2>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {data.workspaceAiCopilot.map((item) => (
            <div key={item} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
              <p className="text-sm leading-7 text-[var(--text-secondary)]">{item}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
