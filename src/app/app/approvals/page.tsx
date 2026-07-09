import { updateApprovalStateAction } from "@/app/app/files/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getApprovalsPageData } from "@/lib/data/files";

type ApprovalsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ApprovalsPage({ searchParams }: ApprovalsPageProps) {
  const [{ error, message }, data] = await Promise.all([searchParams, getApprovalsPageData()]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Approvals"
        title="Review requests, states, and reviewer responsibility now stand on their own"
        description={
          data.usingFallback
            ? "A dedicated approvals route keeps review operations clean while fallback content is still active."
            : "This route now tracks live approval requests, reviewer assignment state, and persisted review updates."
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.approvalSummary.map((item, index) => (
          <Card key={`${item.label}-${index}`} className="p-6">
            <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{item.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Open approval requests</h2>
          <div className="mt-5 space-y-3">
            {data.requests.length > 0 ? data.requests.map((item) => (
              <div key={item.id} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.workspaceName}</p>
                  </div>
                  <span className="pill pill-accent">{item.state}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Reviewers: {item.reviewers}
                </p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Due: {item.dueDate}
                </p>
                <form action={updateApprovalStateAction} className="mt-4 flex flex-wrap items-center gap-3">
                  <input name="approvalId" type="hidden" value={item.id} />
                  <select
                    className="h-11 min-w-[12rem] rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)]"
                    defaultValue={item.state.toLowerCase().replaceAll(" ", "_")}
                    name="state"
                  >
                    <option value="pending_review">Pending review</option>
                    <option value="needs_changes">Needs changes</option>
                    <option value="approved">Approved</option>
                    <option value="archived">Archived</option>
                  </select>
                  <Button type="submit" variant="secondary">
                    Update state
                  </Button>
                </form>
              </div>
            )) : (
              <div className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                <p className="font-semibold">No approval requests yet</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                  Create the first approval request from a workspace or upload a deliverable through the files route.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Reviewer guidance</h2>
          <div className="mt-5 space-y-3">
            {data.guidance.map((item, index) => (
              <div key={`approval-guidance-${index}`} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                <p className="text-sm leading-7 text-[var(--text-secondary)]">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
