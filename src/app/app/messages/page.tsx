import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { SidePanel } from "@/components/ui/side-panel";
import { activeMessages, conversations, meetingActionItems, meetingRecap } from "@/lib/mock";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Messages"
        title="Conversations, meetings, and AI follow-ups now share one calm communication surface"
        description="This route now behaves like a realistic messaging center, balancing thread context, attachments, recap content, and follow-up preparation."
      />

      <section className="grid gap-6 xl:grid-cols-[0.38fr_0.62fr]">
        <Card className="p-6">
          <p className="section-kicker">Inbox</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Conversations</h2>
          <div className="mt-5 space-y-3">
            {conversations.map((conversation, index) => (
              <div
                key={conversation.name}
                className={`p-4 ${
                  index === 0
                    ? "highlight-card"
                    : "inset-card"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{conversation.name}</p>
                  <span className="pill pill-muted">{conversation.unread} unread</span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{conversation.project}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {conversation.preview}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-primary-hover)]">
                  {conversation.time}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-kicker">Live thread</p>
                <h2 className="text-xl font-semibold tracking-[-0.03em]">
                  Northshore weekly review
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Client thread with meeting notes and follow-up actions
                </p>
              </div>
              <span className="pill pill-accent">Live thread</span>
            </div>
            <div className="mt-6 space-y-3">
              {activeMessages.map((message) => (
                <div
                  key={message.body}
                  className={`max-w-[85%] rounded-[22px] p-4 text-sm leading-7 ${
                    message.side === "right"
                      ? "ml-auto border border-[rgba(31,169,113,0.12)] bg-[var(--accent-soft-strong)] text-[var(--text-primary)]"
                      : "border border-[var(--border-subtle)] bg-white text-[var(--text-secondary)]"
                  }`}
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-primary-hover)]">
                    {message.author}
                  </p>
                  {message.body}
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <Card className="p-6">
              <p className="section-kicker">Meeting output</p>
              <h2 className="text-xl font-semibold tracking-[-0.03em]">Meeting recap</h2>
              <div className="highlight-card mt-5 p-4">
                <p className="font-semibold">{meetingRecap.title}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  {meetingRecap.summary}
                </p>
              </div>
              <h3 className="mt-6 text-lg font-semibold tracking-[-0.03em]">AI action items</h3>
              <div className="mt-4 space-y-3">
                {meetingActionItems.map((item) => (
                  <div key={item} className="inset-card p-4">
                    <p className="text-sm leading-7 text-[var(--text-secondary)]">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            <SidePanel
              title="Follow-up generation"
              description="Use this space for AI-drafted recap emails, call summaries, and next-step messaging."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
