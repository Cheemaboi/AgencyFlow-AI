"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildRedirectUrl } from "@/lib/auth/redirects";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getCurrentOrganizationContext } from "@/lib/data/organization";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(message: string, conversationId?: string): never {
  redirect(
    buildRedirectUrl("/app/messages", {
      conversationId,
      message,
    }),
  );
}

function redirectWithError(error: string, conversationId?: string): never {
  redirect(
    buildRedirectUrl("/app/messages", {
      conversationId,
      error,
    }),
  );
}

export async function createConversationAction(formData: FormData) {
  await requireAuthenticatedUser("/app/messages");

  if (!hasSupabaseEnv) {
    redirectWithError("Add Supabase environment variables before creating conversations.");
  }

  const context = await getCurrentOrganizationContext();

  if (!context?.organizationId || !context.profileId) {
    redirectWithError("Could not resolve your organization context.");
  }

  const title = getString(formData, "title");
  const workspaceId = getString(formData, "workspaceId");
  const openingMessage = getString(formData, "openingMessage");

  if (!title) {
    redirectWithError("Conversation title is required.");
  }

  if (!openingMessage) {
    redirectWithError("Add an opening message to start the thread.");
  }

  const admin = createSupabaseAdminClient();
  let validWorkspaceId: string | null = null;

  if (workspaceId) {
    const { data: workspace, error: workspaceError } = await admin
      .from("workspaces")
      .select(
        `
          id,
          projects!inner (
            organization_id
          )
        `,
      )
      .eq("id", workspaceId)
      .eq("projects.organization_id", context.organizationId)
      .maybeSingle();

    if (workspaceError || !workspace) {
      redirectWithError("That workspace is not available for this organization.");
    }

    validWorkspaceId = workspace.id;
  }

  const { data: conversation, error: conversationError } = await admin
    .from("conversations")
    .insert({
      organization_id: context.organizationId,
      title,
      workspace_id: validWorkspaceId,
    })
    .select("id")
    .single();

  if (conversationError || !conversation) {
    redirectWithError(conversationError?.message ?? "Conversation could not be created.");
  }

  const { error: participantError } = await admin.from("conversation_participants").insert({
    conversation_id: conversation.id,
    profile_id: context.profileId,
  });

  if (participantError) {
    redirectWithError(participantError.message);
  }

  const { error: messageError } = await admin.from("messages").insert({
    author_profile_id: context.profileId,
    body: openingMessage,
    conversation_id: conversation.id,
    internal_only: false,
  });

  if (messageError) {
    redirectWithError(messageError.message, conversation.id);
  }

  revalidatePath("/app");
  revalidatePath("/app/messages");
  redirectWithMessage("Conversation created.", conversation.id);
}

export async function sendMessageAction(formData: FormData) {
  await requireAuthenticatedUser("/app/messages");

  if (!hasSupabaseEnv) {
    redirectWithError("Add Supabase environment variables before sending messages.");
  }

  const context = await getCurrentOrganizationContext();

  if (!context?.organizationId || !context.profileId) {
    redirectWithError("Could not resolve your organization context.");
  }

  const conversationId = getString(formData, "conversationId");
  const body = getString(formData, "body");

  if (!conversationId) {
    redirectWithError("Choose a conversation before sending a message.");
  }

  if (!body) {
    redirectWithError("Message body is required.", conversationId);
  }

  const admin = createSupabaseAdminClient();
  const { data: conversation, error: conversationError } = await admin
    .from("conversations")
    .select("id, organization_id")
    .eq("id", conversationId)
    .eq("organization_id", context.organizationId)
    .maybeSingle();

  if (conversationError || !conversation) {
    redirectWithError("Conversation not found.", conversationId);
  }

  const { error } = await admin.from("messages").insert({
    author_profile_id: context.profileId,
    body,
    conversation_id: conversationId,
    internal_only: false,
  });

  if (error) {
    redirectWithError(error.message, conversationId);
  }

  revalidatePath("/app");
  revalidatePath("/app/messages");
  redirectWithMessage("Message sent.", conversationId);
}
