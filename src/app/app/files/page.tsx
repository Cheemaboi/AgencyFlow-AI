import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { MiniBarChart } from "@/components/ui/mini-bar-chart";
import { SidePanel } from "@/components/ui/side-panel";
import { approvalSummary, fileFolders, uploadQueue, versionHistory } from "@/lib/mock";

export default function FilesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Files & approvals"
        title="Deliverables, review states, and versions now feel like one intentional workflow"
        description="This screen combines folders, upload queues, approval visibility, and revision history without losing clarity."
      />

      <section className="grid gap-4 xl:grid-cols-3">
        {fileFolders.map((folder) => (
          <Card key={folder.name} className="p-6">
            <p className="section-kicker">Folder health</p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-semibold tracking-[-0.02em]">{folder.name}</p>
              <span className="pill pill-muted">{folder.status}</span>
            </div>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">{folder.count}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_0.8fr_0.75fr]">
        <Card className="p-6">
          <p className="section-kicker">Queue</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Recent uploads</h2>
          <div className="mt-5 space-y-3">
            {uploadQueue.map((item) => (
              <div key={item.name} className="inset-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.name}</p>
                  <span className="pill pill-accent">{item.version}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.state}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="section-kicker">Approval mix</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Approval states</h2>
          <div className="mt-5">
            <MiniBarChart items={approvalSummary.map((item) => ({ label: item.label, value: item.value }))} />
          </div>
        </Card>

        <SidePanel
          title="AI review helper"
          description="Bundle missing assets, suggest reviewers, and surface what still blocks final approval."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <p className="section-kicker">Timeline</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Version history</h2>
          <div className="mt-5 space-y-3">
            {versionHistory.map((item) => (
              <div key={item.version} className="inset-card p-4">
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
          <div className="mt-5 rounded-[22px] border border-dashed border-[var(--accent-primary)]/35 bg-[var(--accent-soft)]/55 px-5 py-10 text-center">
            <p className="font-semibold">Drop files here</p>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              Future upload flow for metadata, approvers, workspace association, and version-safe delivery.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
