import { generateFilesReviewHelperAction } from "@/app/app/ai/actions";
import { uploadDeliverableAction } from "@/app/app/files/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MiniBarChart } from "@/components/ui/mini-bar-chart";
import { SidePanel } from "@/components/ui/side-panel";
import { StatusPill } from "@/components/ui/status-pill";
import { SubmitButton } from "@/components/ui/submit-button";
import { getFilesPageData } from "@/lib/data/files";

type FilesPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function FilesPage({ searchParams }: FilesPageProps) {
  const [{ error, message }, data] = await Promise.all([searchParams, getFilesPageData()]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Files & approvals"
        title="Deliverables, review states, and versions now feel like one intentional workflow"
        description={
          data.usingFallback
            ? "This screen is still showing designed fallback file states until live uploads are added."
            : "This screen now combines live deliverables, approval visibility, and version history from Supabase-backed storage metadata."
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

      <section className="grid gap-4 xl:grid-cols-3">
        {data.folderCards.map((folder, index) => (
          <Card key={`${folder.name}-${folder.status}-${index}`} className="p-6">
            <p className="section-kicker">Folder health</p>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="[overflow-wrap:normal] max-w-[16rem] text-lg font-semibold tracking-[-0.02em] break-words">
                {folder.name}
              </p>
              <StatusPill status={folder.status}>{folder.status}</StatusPill>
            </div>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">{folder.count}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,0.8fr)_minmax(0,0.75fr)]">
        <Card className="p-6">
          <p className="section-kicker">Queue</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Recent uploads</h2>
          <div className="mt-5 space-y-3">
            {data.uploadItems.map((item, index) => (
              <div key={`${item.name}-${item.version}-${index}`} className="inset-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="[overflow-wrap:normal] max-w-[18rem] font-semibold break-words">
                    {item.name}
                  </p>
                  <span className="pill pill-accent">{item.version}</span>
                </div>
                <div className="mt-3">
                  <StatusPill status={item.state}>{item.state}</StatusPill>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="section-kicker">Approval mix</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Approval states</h2>
          <div className="mt-5">
            <MiniBarChart items={data.approvalSummary.map((item) => ({ label: item.label, value: item.value }))} />
          </div>
        </Card>

        <SidePanel
          title="AI review helper"
          description="Bundle missing assets, suggest reviewers, and surface what still blocks final approval."
        >
          <form action={generateFilesReviewHelperAction} className="space-y-3">
            <SubmitButton className="w-full" pendingLabel="Preparing helper...">
              Generate review helper
            </SubmitButton>
          </form>
          <div className="mt-4 space-y-3">
            {data.latestReviewHelper.map((item, index) => (
              <div key={`review-helper-${index}`} className="inset-card px-4 py-3">
                <p className="text-sm leading-6 text-[var(--text-secondary)]">{item}</p>
              </div>
            ))}
          </div>
        </SidePanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-6">
          <p className="section-kicker">Timeline</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Version history</h2>
          <div className="mt-5 space-y-3">
            {data.versionItems.map((item, index) => (
              <div key={`${item.version}-${item.date}-${index}`} className="inset-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.version}</p>
                  <span className="text-sm text-[var(--text-secondary)]">{item.date}</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.note}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <p className="section-kicker">New delivery</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Upload deliverable</h2>
          <form action={uploadDeliverableAction} className="mt-5 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">Workspace</span>
              <select
                className="h-12 w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)]"
                defaultValue=""
                name="workspaceId"
                required
              >
                <option value="" disabled>
                  {data.workspaceOptions.length > 0 ? "Select a workspace" : "Create a workspace first"}
                </option>
                {data.workspaceOptions.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">Initial status</span>
              <select
                className="h-12 w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)]"
                defaultValue="pending_review"
                name="status"
              >
                <option value="pending_review">Pending review</option>
                <option value="needs_changes">Needs changes</option>
                <option value="approved">Approved</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">File</span>
              <input
                className="block w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-4 file:py-2 file:font-semibold file:text-[var(--accent-primary-hover)]"
                name="file"
                required
                type="file"
              />
            </label>
            <Button className="w-full" disabled={data.workspaceOptions.length === 0} type="submit">
              Upload deliverable
            </Button>
          </form>
        </Card>
      </section>
    </div>
  );
}
