import {
  activeMessages,
  conversations,
  meetingActionItems,
  meetingRecap,
} from "@/lib/mock";
import { splitAiText } from "@/lib/ai";
import { getCurrentOrganizationContext } from "@/lib/data/organization";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatShortDate } from "@/lib/data/format";

type ConversationListItem = {
  id: string;
  name: string;
  preview: string;
  project: string;
  time: string;
  unread: number;
};

type MessageThreadItem = {
  author: string;
  body: string;
  side: "left" | "right";
};

type MessagesPageData = {
  activeConversationId: string | null;
  activeWorkspaceId: string | null;
  aiInputSummary: string;
  conversationItems: ConversationListItem[];
  followUpDraft: string[];
  meetingActionItems: string[];
  meetingRecap: {
    summary: string;
    title: string;
  };
  threadMessages: MessageThreadItem[];
  threadMeta: {
    label: string;
    subtitle: string;
    title: string;
  };
  usingFallback: boolean;
  workspaceOptions: Array<{ id: string; name: string }>;
};

function buildFallbackThreadMessages(): MessageThreadItem[] {
  return activeMessages.map((message) => ({
    author: message.author,
    body: message.body,
    side: message.side === "right" ? "right" : "left",
  }));
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export async function getMessagesPageData(
  requestedConversationId?: string,
): Promise<MessagesPageData> {
  const context = await getCurrentOrganizationContext();

  if (!context?.organizationId || !context.profileId) {
    return {
      activeConversationId: null,
      activeWorkspaceId: null,
      aiInputSummary: [
        "Fallback conversation context",
        "Conversation: Northshore weekly review",
        ...activeMessages.map((message) => `${message.author}: ${message.body}`),
        `Meeting recap: ${meetingRecap.title} - ${meetingRecap.summary}`,
      ].join("\n"),
      conversationItems: conversations.map((conversation, index) => ({
        id: `fallback-${index}`,
        name: conversation.name,
        preview: conversation.preview,
        project: conversation.project,
        time: conversation.time,
        unread: conversation.unread,
      })),
      followUpDraft: [
        "Follow-up drafts appear here after the first conversation context is available.",
      ],
      meetingActionItems,
      meetingRecap,
      threadMessages: buildFallbackThreadMessages(),
      threadMeta: {
        label: "Live thread",
        subtitle: "Client thread with meeting notes and follow-up actions",
        title: "Northshore weekly review",
      },
      usingFallback: true,
      workspaceOptions: [],
    };
  }

  const admin = createSupabaseAdminClient();
  const [conversationsResult, messagesResult, workspacesResult, notesResult] = await Promise.all([
    admin
      .from("conversations")
      .select(
        `
          id,
          title,
          updated_at,
          workspace_id,
          workspaces (
            name
          )
        `,
      )
      .eq("organization_id", context.organizationId)
      .order("updated_at", { ascending: false }),
    admin
      .from("messages")
      .select(
        `
          id,
          body,
          internal_only,
          created_at,
          conversation_id,
          author_profile_id,
          profiles (
            full_name
          )
        `,
      )
      .order("created_at", { ascending: true }),
    admin
      .from("workspaces")
      .select(
        `
          id,
          name,
          projects!inner (
            organization_id
          )
        `,
      )
      .eq("projects.organization_id", context.organizationId)
      .order("created_at", { ascending: false }),
    admin
      .from("meeting_notes")
      .select(
        `
          title,
          summary,
          workspace_id,
          workspaces!inner (
            projects!inner (
              organization_id
            )
          )
        `,
      )
      .eq("workspaces.projects.organization_id", context.organizationId)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  if (conversationsResult.error || messagesResult.error || workspacesResult.error || notesResult.error) {
    return {
      activeConversationId: null,
      activeWorkspaceId: null,
      aiInputSummary: [
        "Fallback conversation context",
        "Conversation: Northshore weekly review",
        ...activeMessages.map((message) => `${message.author}: ${message.body}`),
        `Meeting recap: ${meetingRecap.title} - ${meetingRecap.summary}`,
      ].join("\n"),
      conversationItems: conversations.map((conversation, index) => ({
        id: `fallback-${index}`,
        name: conversation.name,
        preview: conversation.preview,
        project: conversation.project,
        time: conversation.time,
        unread: conversation.unread,
      })),
      followUpDraft: [
        "Follow-up drafts appear here after the first conversation context is available.",
      ],
      meetingActionItems,
      meetingRecap,
      threadMessages: buildFallbackThreadMessages(),
      threadMeta: {
        label: "Live thread",
        subtitle: "Client thread with meeting notes and follow-up actions",
        title: "Northshore weekly review",
      },
      usingFallback: true,
      workspaceOptions: [],
    };
  }

  const realConversations = conversationsResult.data ?? [];
  const realMessages = context.role === "client"
    ? (messagesResult.data ?? []).filter((message) => !message.internal_only)
    : (messagesResult.data ?? []);
  const workspaceOptions = (workspacesResult.data ?? []).map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
  }));

  if (realConversations.length === 0) {
    return {
      activeConversationId: null,
      activeWorkspaceId: null,
      aiInputSummary: [
        "No live conversations yet.",
        "Use the first thread, its recap, and the most recent replies to draft the next follow-up.",
      ].join("\n"),
      conversationItems: [],
      followUpDraft: [
        "Create a conversation first, then the assistant can draft recap or follow-up language from the live thread.",
      ],
      meetingActionItems: [
        "Create your first conversation to centralize client updates and internal replies.",
        "Reply from the live thread area to start building message history.",
        "Later we can layer in participant-specific unread state and attachments.",
      ],
      meetingRecap: {
        summary:
          "No meeting recap exists yet. Once notes are added, they will appear here as part of the live communication workflow.",
        title: "Awaiting first recap",
      },
      threadMessages: [],
      threadMeta: {
        label: "Inbox empty",
        subtitle: "Create a conversation to begin the live messaging flow",
        title: "No conversations yet",
      },
      usingFallback: false,
      workspaceOptions,
    };
  }

  const activeConversation =
    realConversations.find((conversation) => conversation.id === requestedConversationId) ??
    realConversations[0];
  const activeWorkspaceId = activeConversation.workspace_id ?? null;
  let latestAiQuery = admin
    .from("ai_generations")
    .select("output_text")
    .eq("organization_id", context.organizationId)
    .eq("prompt_type", "follow_up")
    .order("created_at", { ascending: false })
    .limit(1);

  latestAiQuery = activeWorkspaceId
    ? latestAiQuery.eq("workspace_id", activeWorkspaceId)
    : latestAiQuery.is("workspace_id", null);

  const latestAiResult = await latestAiQuery.maybeSingle();

  const threadMessages = realMessages
    .filter((message) => message.conversation_id === activeConversation.id)
    .map((message) => ({
      author: firstRelation(message.profiles)?.full_name ?? "Team member",
      body: message.body,
      side: message.author_profile_id === context.profileId ? "right" : "left",
    })) satisfies MessageThreadItem[];

  const latestNote = (notesResult.data ?? [])[0];
  const aiInputSummary = [
    `Organization: ${context.organizationName}`,
    `Conversation: ${activeConversation.title}`,
    `Workspace: ${firstRelation(activeConversation.workspaces)?.name ?? "Organization thread"}`,
    ...threadMessages.slice(-4).map((message) => `${message.author}: ${message.body}`),
    latestNote
      ? `Meeting recap: ${latestNote.title} - ${latestNote.summary ?? "Summary pending."}`
      : "No meeting recap saved yet.",
  ].join("\n");

  return {
    activeConversationId: activeConversation.id,
    activeWorkspaceId,
    aiInputSummary,
    conversationItems: realConversations.map((conversation) => {
      const conversationMessages = realMessages.filter(
        (message) => message.conversation_id === conversation.id,
      );
      const previewMessage = conversationMessages.at(-1);

      return {
        id: conversation.id,
        name: conversation.title,
        preview: previewMessage?.body ?? "No messages yet.",
        project: firstRelation(conversation.workspaces)?.name ?? "Organization thread",
        time: previewMessage?.created_at
          ? formatShortDate(previewMessage.created_at)
          : formatShortDate(conversation.updated_at),
        unread: conversationMessages.filter(
          (message) => message.author_profile_id !== context.profileId,
        ).length,
      };
    }),
    followUpDraft: latestAiResult.data?.output_text
      ? splitAiText(latestAiResult.data.output_text)
      : [
          "Generate a live follow-up draft from the current thread once you want a clean client-facing recap.",
        ],
    meetingActionItems:
      threadMessages.length > 0
        ? [
            "Reply from the live thread to keep next steps documented in one place.",
            "Use meeting notes to summarize decisions after calls and reviews.",
            "This thread is now ready for future client-safe vs internal-only separation.",
          ]
        : [
            "Send the first message to establish a live thread history.",
            "Use meeting notes to summarize decisions after calls and reviews.",
            "This thread is now ready for future client-safe vs internal-only separation.",
          ],
    meetingRecap: latestNote
      ? {
          summary:
            latestNote.summary ??
            "Meeting note saved. Add a richer summary when the recap workflow is expanded.",
          title: latestNote.title,
        }
      : {
          summary:
            "No meeting recap has been stored for this organization yet, so this space is holding a clean placeholder.",
          title: "Awaiting first recap",
        },
    threadMessages,
    threadMeta: {
      label: "Live thread",
      subtitle:
        firstRelation(activeConversation.workspaces)?.name
          ? `Workspace thread for ${firstRelation(activeConversation.workspaces)?.name}`
          : "Organization thread with live persisted messages",
      title: activeConversation.title,
    },
    usingFallback: false,
    workspaceOptions,
  };
}
