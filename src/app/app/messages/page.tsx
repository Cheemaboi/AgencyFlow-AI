import Link from "next/link";
import { generateFollowUpAction } from "@/app/app/ai/actions";
import { createConversationAction, sendMessageAction } from "@/app/app/messages/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SidePanel } from "@/components/ui/side-panel";
import { SubmitButton } from "@/components/ui/submit-button";
import { getMessagesPageData } from "@/lib/data/messages";

type MessagesPageProps = {
  searchParams: Promise<{
    conversationId?: string;
    error?: string;
    message?: string;
  }>;
};

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const { conversationId, error, message } = await searchParams;
  const data = await getMessagesPageData(conversationId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Messages"
        title="Conversations, meetings, and AI follow-ups now share one calm communication surface"
        description={
          data.usingFallback
            ? "This route is still using polished fallback communication content until live conversation records are present."
            : "This route now behaves like a real organization messaging center with persisted threads and reply history."
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

      <section className="grid gap-6 xl:grid-cols-[0.38fr_0.62fr]">
        <Card className="p-6">
          <p className="section-kicker">Inbox</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Conversations</h2>
          <div className="mt-5 space-y-3">
            {data.conversationItems.length > 0 ? (
              data.conversationItems.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/app/messages?conversationId=${conversation.id}`}
                  className={`block p-4 ${
                    data.activeConversationId === conversation.id
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
                </Link>
              ))
            ) : (
              <div className="inset-card p-4">
                <p className="font-semibold">No conversations yet</p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  Create the first live thread below and it will appear in this inbox.
                </p>
              </div>
            )}
          </div>
          <form action={createConversationAction} className="mt-6 space-y-3 border-t border-[var(--border-subtle)] pt-6">
            <Input label="New conversation" name="title" placeholder="Northshore weekly review" required />
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">Workspace</span>
              <select
                className="h-12 w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)]"
                defaultValue=""
                name="workspaceId"
              >
                <option value="">Organization-wide thread</option>
                {data.workspaceOptions.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">Opening message</span>
              <textarea
                className="min-h-28 w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-primary)]"
                name="openingMessage"
                placeholder="Kick off the thread with the latest review context or next steps."
                required
              />
            </label>
            <Button className="w-full" type="submit">
              Create conversation
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-kicker">{data.threadMeta.label}</p>
                <h2 className="text-xl font-semibold tracking-[-0.03em]">
                  {data.threadMeta.title}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {data.threadMeta.subtitle}
                </p>
              </div>
              <span className="pill pill-accent">Live thread</span>
            </div>
            <div className="mt-6 space-y-3">
              {data.threadMessages.length > 0 ? data.threadMessages.map((message, index) => (
                <div
                  key={`${message.author}-${message.body}-${index}`}
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
              )) : (
                <div className="inset-card p-4">
                  <p className="font-semibold">No messages yet</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                    Send the first reply below to start the live thread history.
                  </p>
                </div>
              )}
            </div>
            {data.activeConversationId ? (
              <form action={sendMessageAction} className="mt-6 space-y-3 border-t border-[var(--border-subtle)] pt-6">
                <input name="conversationId" type="hidden" value={data.activeConversationId} />
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">Reply</span>
                  <textarea
                    className="min-h-28 w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-primary)]"
                    name="body"
                    placeholder="Write the next update, answer, or follow-up."
                    required
                  />
                </label>
                <Button type="submit">Send message</Button>
              </form>
            ) : null}
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <Card className="p-6">
              <p className="section-kicker">Meeting output</p>
              <h2 className="text-xl font-semibold tracking-[-0.03em]">Meeting recap</h2>
              <div className="highlight-card mt-5 p-4">
                <p className="font-semibold">{data.meetingRecap.title}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  {data.meetingRecap.summary}
                </p>
              </div>
              <h3 className="mt-6 text-lg font-semibold tracking-[-0.03em]">AI action items</h3>
              <div className="mt-4 space-y-3">
                {data.meetingActionItems.map((item, index) => (
                  <div key={`meeting-action-${index}`} className="inset-card p-4">
                    <p className="text-sm leading-7 text-[var(--text-secondary)]">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            <SidePanel
              title="Follow-up generation"
              description="Use this space for AI-drafted recap emails, call summaries, and next-step messaging."
            >
              <form action={generateFollowUpAction} className="space-y-3">
                <input name="conversationId" type="hidden" value={data.activeConversationId ?? ""} />
                <SubmitButton className="w-full" pendingLabel="Drafting follow-up...">
                  Generate follow-up
                </SubmitButton>
              </form>
              <div className="mt-4 space-y-3">
                {data.followUpDraft.map((item, index) => (
                  <div key={`follow-up-${index}`} className="inset-card px-4 py-3">
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">{item}</p>
                  </div>
                ))}
              </div>
            </SidePanel>
          </div>
        </div>
      </section>
    </div>
  );
}
