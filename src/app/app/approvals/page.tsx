import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { approvalSummary, workspaceApprovals } from "@/lib/mock";

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Approvals"
        title="Review requests, states, and reviewer responsibility now stand on their own"
        description="A dedicated approvals route keeps review operations clean, especially once file history, comments, and client visibility get denser."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {approvalSummary.map((item) => (
          <Card key={item.label} className="p-6">
            <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{item.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Open approval requests</h2>
          <div className="mt-5 space-y-3">
            {workspaceApprovals.map((item) => (
              <div key={item.item} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.item}</p>
                  <span className="pill pill-accent">{item.state}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Reviewers: {item.reviewers}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Reviewer guidance</h2>
          <div className="mt-5 space-y-3">
            {[
              "Bundle mobile and desktop variants together so review feedback stays consolidated.",
              "Keep internal-only notes separate from client-facing comments before Phase 3 data wiring.",
              "Prepare concise AI-generated approval summaries for stakeholders who only need decision context.",
            ].map((item) => (
              <div key={item} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                <p className="text-sm leading-7 text-[var(--text-secondary)]">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
