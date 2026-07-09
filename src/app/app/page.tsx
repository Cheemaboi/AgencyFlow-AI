import { generateDashboardBriefAction } from "@/app/app/ai/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MiniBarChart } from "@/components/ui/mini-bar-chart";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusPill } from "@/components/ui/status-pill";
import { StatCard } from "@/components/ui/stat-card";
import { SubmitButton } from "@/components/ui/submit-button";
import { getDashboardData } from "@/lib/data/dashboard";

type AppHomePageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function AppHomePage({ searchParams }: AppHomePageProps) {
  const [{ error, message }, data] = await Promise.all([searchParams, getDashboardData()]);
  const quickActionLinks = {
    "Generate client update": "/app/workspaces",
    "Prepare approval bundle": "/app/files",
    "Summarize blockers": "/app/projects",
    "Draft follow-up": "/app/messages",
  } as const;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="A polished command center for day-to-day agency operations"
        description={
          data.usingFallback
            ? "This dashboard is still showing polished fallback data until Supabase records are available for your account."
            : `Live organization data is now feeding this overview for ${data.organizationName}.`
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
        {data.dashboardMetrics.map((metric, index) => (
          <StatCard key={`${metric.label}-${metric.value}-${index}`} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <Card className="p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-kicker">AI quick actions</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                Keep updates, approvals, and follow-ups moving without context switching
              </h2>
            </div>
            <form action={generateDashboardBriefAction}>
              <SubmitButton pendingLabel="Generating brief...">Generate live brief</SubmitButton>
            </form>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {data.quickActions.map((item, index) => (
              <Button
                key={`${item}-${index}`}
                href={quickActionLinks[item as keyof typeof quickActionLinks]}
                className="inset-card px-4 py-4 text-left text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-soft)]"
                variant="ghost"
              >
                {item}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-kicker">AI brief</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                Today&apos;s client and delivery readout
              </h2>
            </div>
            <Badge tone="accent">{data.usingFallback ? "Demo mode" : "Live org"}</Badge>
          </div>
          <div className="mt-6 space-y-3">
            {data.aiBrief.map((item, index) => (
              <div key={`${item}-${index}`} className="inset-card p-4">
                <p className="text-sm leading-7 text-[var(--text-secondary)]">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)_minmax(0,0.9fr)]">
        <Card className="p-6">
          <p className="section-kicker">Daily rhythm</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Today&apos;s tasks</h2>
          <div className="mt-5 grid gap-3">
            {data.overviewTasks.map((item, index) => (
              <div key={`${item.title}-${item.time}-${index}`} className="inset-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.title}</p>
                  <span className="pill pill-muted">{item.time}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {item.description}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-primary-hover)]">
                  Owner: {item.owner}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="section-kicker">Delivery status</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Project health</h2>
          <div className="mt-5 space-y-4">
            {data.projectHealth.map((project, index) => (
              <div key={`${project.name}-${project.owner}-${index}`} className="inset-card p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{project.name}</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{project.owner}</p>
                  </div>
                  <span className="pill pill-accent">{project.status}</span>
                </div>
                <div className="mt-4">
                  <ProgressBar value={project.progress} />
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{project.progress}% complete</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="section-kicker">Calendar</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Upcoming meetings</h2>
          <div className="mt-5 space-y-3">
            {data.upcomingMeetings.map((meeting, index) => (
              <div key={`${meeting.title}-${meeting.time}-${index}`} className="inset-card p-4">
                <p className="font-semibold">{meeting.title}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{meeting.time}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-primary-hover)]">
                  {meeting.type}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr_0.9fr]">
        <Card className="p-6">
          <p className="section-kicker">Signals</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Recent client activity</h2>
          <div className="mt-5 space-y-4">
            {data.recentActivity.map((item, index) => (
              <div key={`${item.title}-${item.time}-${index}`} className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{item.detail}</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="section-kicker">Asset view</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Recent files</h2>
          <div className="mt-5 space-y-3">
            {data.recentFiles.map((file, index) => (
              <div key={`${file.name}-${file.status}-${index}`} className="inset-card p-4">
                <p className="[overflow-wrap:normal] text-base font-semibold leading-7 break-words">
                  {file.name}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-secondary)]">
                  <span>{file.size}</span>
                  <StatusPill status={file.status}>{file.status}</StatusPill>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="section-kicker">Revenue mix</p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em]">Revenue by client</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Strongest client concentration at a glance.
              </p>
            </div>
            <div className="min-w-[7.25rem] rounded-[18px] border border-[rgba(31,169,113,0.16)] bg-[var(--accent-soft)] px-4 py-3 text-center sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary-hover)]">
                Top share
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                {data.revenueByClient[0]?.value ?? 0}%
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-[22px] border border-[rgba(31,169,113,0.12)] bg-[linear-gradient(180deg,rgba(232,248,240,0.56),rgba(255,255,255,0.98))] p-4">
            <MiniBarChart items={data.revenueByClient.map((item) => ({ label: item.client, value: item.value }))} suffix="%" />
          </div>
        </Card>
      </section>
    </div>
  );
}
