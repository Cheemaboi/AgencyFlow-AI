import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MiniBarChart } from "@/components/ui/mini-bar-chart";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatCard } from "@/components/ui/stat-card";
import {
  aiBrief,
  dashboardMetrics,
  overviewTasks,
  projectHealth,
  quickActions,
  recentActivity,
  recentFiles,
  revenueByClient,
  upcomingMeetings,
} from "@/lib/mock";

export default function AppHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="A polished command center for day-to-day agency operations"
        description="This dashboard now acts like a real premium SaaS overview with AI quick actions, delivery signals, meetings, activity, and operational summaries all working together."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
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
            <Badge tone="accent">Assistant ready</Badge>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {quickActions.map((item) => (
              <button
                key={item}
                className="inset-card px-4 py-4 text-left text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-soft)]"
              >
                {item}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 sm:p-7">
          <p className="section-kicker">AI brief</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
            Today&apos;s client and delivery readout
          </h2>
          <div className="mt-6 space-y-3">
            {aiBrief.map((item) => (
              <div key={item} className="inset-card p-4">
                <p className="text-sm leading-7 text-[var(--text-secondary)]">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr_0.9fr]">
        <Card className="p-6">
          <p className="section-kicker">Daily rhythm</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Today&apos;s tasks</h2>
          <div className="mt-5 grid gap-3">
            {overviewTasks.map((item) => (
              <div key={item.title} className="inset-card p-4">
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
            {projectHealth.map((project) => (
              <div key={project.name} className="inset-card p-4">
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
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.title} className="inset-card p-4">
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
            {recentActivity.map((item) => (
              <div key={item.title} className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4 last:border-b-0 last:pb-0">
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
            {recentFiles.map((file) => (
              <div key={file.name} className="inset-card p-4">
                <p className="font-semibold">{file.name}</p>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[var(--text-secondary)]">
                  <span>{file.size}</span>
                  <span>{file.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="section-kicker">Revenue mix</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Revenue by client</h2>
          <div className="mt-5">
            <MiniBarChart items={revenueByClient.map((item) => ({ label: item.client, value: item.value }))} suffix="%" />
          </div>
        </Card>
      </section>
    </div>
  );
}
