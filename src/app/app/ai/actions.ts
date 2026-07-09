"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateAiText, type AiPromptType } from "@/lib/ai";
import { buildRedirectUrl } from "@/lib/auth/redirects";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/data/dashboard";
import { getBillingData } from "@/lib/data/billing";
import { getFilesPageData } from "@/lib/data/files";
import { getMessagesPageData } from "@/lib/data/messages";
import { getCurrentOrganizationContext } from "@/lib/data/organization";
import { getWorkspaceDetailData } from "@/lib/data/workspaces";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function redirectWithError(path: string, error: string): never {
  redirect(
    buildRedirectUrl(path, {
      error,
    }),
  );
}

async function persistAiGeneration({
  inputSummary,
  path,
  promptType,
  workspaceId = null,
}: {
  inputSummary: string;
  path: string;
  promptType: AiPromptType;
  workspaceId?: string | null;
}) {
  await requireAuthenticatedUser(path);
  const context = await getCurrentOrganizationContext();

  if (!context?.organizationId) {
    redirectWithError(path, "Could not resolve your organization context for AI generation.");
  }

  const result = await generateAiText({
    inputSummary,
    promptType,
  });
  const revalidateTarget = path.split("?")[0] || path;

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("ai_generations").insert({
    created_by: context.profileId || null,
    input_summary: inputSummary,
    organization_id: context.organizationId,
    output_text: result.outputText,
    prompt_type: promptType,
    workspace_id: workspaceId,
  });

  if (error) {
    redirectWithError(path, error.message);
  }

  await admin.from("activity_logs").insert({
    action: "ai_generated",
    details: {
      model_used: result.modelUsed ?? null,
      prompt_type: promptType,
      used_fallback: result.usedFallback,
    },
    entity_id: workspaceId,
    entity_type: workspaceId ? "workspace_ai" : "organization_ai",
    organization_id: context.organizationId,
    profile_id: context.profileId || null,
  });

  revalidatePath(revalidateTarget);

  redirect(
    buildRedirectUrl(path, {
      message: result.usedFallback
        ? "AI draft generated using the local fallback layer. Add an OpenRouter key to switch to live model output."
        : `AI draft generated${result.modelUsed ? ` with ${result.modelUsed}.` : "."}`,
    }),
  );
}

export async function generateDashboardBriefAction() {
  const data = await getDashboardData();

  if (!data.aiInputSummary) {
    redirectWithError("/app", "There is not enough live context to generate a dashboard brief yet.");
  }

  await persistAiGeneration({
    inputSummary: data.aiInputSummary,
    path: "/app",
    promptType: "dashboard_summary",
  });
}

export async function generateWorkspaceUpdateAction(workspaceId: string) {
  const data = await getWorkspaceDetailData(workspaceId);

  if (!data?.aiInputSummary) {
    redirectWithError(`/app/workspaces/${workspaceId}`, "Could not build the workspace AI context.");
  }

  await persistAiGeneration({
    inputSummary: data.aiInputSummary,
    path: `/app/workspaces/${workspaceId}`,
    promptType: "workspace_update",
    workspaceId,
  });
}

export async function generateFilesReviewHelperAction() {
  const data = await getFilesPageData();

  if (!data.aiInputSummary) {
    redirectWithError("/app/files", "There is not enough file activity to generate a review helper yet.");
  }

  await persistAiGeneration({
    inputSummary: data.aiInputSummary,
    path: "/app/files",
    promptType: "review_helper",
  });
}

export async function generateFollowUpAction(formData: FormData) {
  const conversationId = typeof formData.get("conversationId") === "string"
    ? String(formData.get("conversationId"))
    : undefined;
  const data = await getMessagesPageData(conversationId);

  if (!data.aiInputSummary) {
    redirectWithError("/app/messages", "There is not enough conversation context to draft a follow-up yet.");
  }

  await persistAiGeneration({
    inputSummary: data.aiInputSummary,
    path: conversationId ? `/app/messages?conversationId=${conversationId}` : "/app/messages",
    promptType: "follow_up",
    workspaceId: data.activeWorkspaceId,
  });
}

export async function generateBillingInsightsAction() {
  const data = await getBillingData();

  if (!data.aiInputSummary) {
    redirectWithError("/app/billing", "There is not enough billing context to generate finance insights yet.");
  }

  await persistAiGeneration({
    inputSummary: data.aiInputSummary,
    path: "/app/billing",
    promptType: "billing_insights",
  });
}
