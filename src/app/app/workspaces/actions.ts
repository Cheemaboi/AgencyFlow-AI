"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildRedirectUrl } from "@/lib/auth/redirects";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getCurrentOrganizationContext } from "@/lib/data/organization";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const projectStages = ["backlog", "in_progress", "review", "approved", "delivered"] as const;
const taskStates = ["todo", "in_progress", "ready", "blocked", "done"] as const;
const approvalStates = ["pending_review", "needs_changes", "approved", "archived"] as const;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectToWorkspacesError(error: string): never {
  redirect(
    buildRedirectUrl("/app/workspaces", {
      error,
    }),
  );
}

function redirectToWorkspacesMessage(message: string): never {
  redirect(
    buildRedirectUrl("/app/workspaces", {
      message,
    }),
  );
}

function redirectToWorkspaceDetail(workspaceId: string, field: "error" | "message", value: string): never {
  redirect(
    buildRedirectUrl(`/app/workspaces/${workspaceId}`, {
      [field]: value,
    }),
  );
}

export async function createWorkspaceAction(formData: FormData) {
  await requireAuthenticatedUser("/app/workspaces");

  if (!hasSupabaseEnv) {
    redirectToWorkspacesError("Add Supabase environment variables before creating workspaces.");
  }

  const context = await getCurrentOrganizationContext();

  if (!context) {
    redirectToWorkspacesError("Could not resolve your organization context.");
  }

  const name = getString(formData, "name");
  const summary = getString(formData, "summary");
  const stage = getString(formData, "stage");
  const projectId = getString(formData, "projectId");

  if (!name) {
    redirectToWorkspacesError("Workspace name is required.");
  }

  if (!projectId) {
    redirectToWorkspacesError("Choose a project for this workspace.");
  }

  if (!projectStages.includes(stage as (typeof projectStages)[number])) {
    redirectToWorkspacesError("Choose a valid workspace stage.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("organization_id", context.organizationId)
    .maybeSingle();

  if (projectError || !project) {
    redirectToWorkspacesError("That project is not available in your organization.");
  }

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({
      name,
      project_id: project.id,
      stage,
      summary: summary || null,
    })
    .select("id")
    .single();

  if (error || !workspace) {
    redirectToWorkspacesError(error?.message ?? "Workspace could not be created.");
  }

  revalidatePath("/app");
  revalidatePath("/app/projects");
  revalidatePath("/app/workspaces");
  redirectToWorkspacesMessage("Workspace created.");
}

export async function createTaskAction(workspaceId: string, formData: FormData) {
  await requireAuthenticatedUser(`/app/workspaces/${workspaceId}`);

  if (!hasSupabaseEnv) {
    redirectToWorkspaceDetail(
      workspaceId,
      "error",
      "Add Supabase environment variables before creating tasks.",
    );
  }

  const title = getString(formData, "title");
  const state = getString(formData, "state");
  const dueDate = getString(formData, "dueDate");

  if (!title) {
    redirectToWorkspaceDetail(workspaceId, "error", "Task title is required.");
  }

  if (!taskStates.includes(state as (typeof taskStates)[number])) {
    redirectToWorkspaceDetail(workspaceId, "error", "Choose a valid task state.");
  }

  const context = await getCurrentOrganizationContext();

  if (!context) {
    redirectToWorkspaceDetail(workspaceId, "error", "Could not resolve your organization context.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: workspace, error: workspaceError } = await supabase
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
    redirectToWorkspaceDetail(workspaceId, "error", "Workspace not found.");
  }

  const { error } = await supabase.from("tasks").insert({
    due_date: dueDate || null,
    state,
    title,
    workspace_id: workspaceId,
  });

  if (error) {
    redirectToWorkspaceDetail(workspaceId, "error", error.message);
  }

  revalidatePath("/app");
  revalidatePath("/app/workspaces");
  revalidatePath(`/app/workspaces/${workspaceId}`);
  redirectToWorkspaceDetail(workspaceId, "message", "Task added.");
}

export async function createApprovalRequestAction(workspaceId: string, formData: FormData) {
  await requireAuthenticatedUser(`/app/workspaces/${workspaceId}`);

  if (!hasSupabaseEnv) {
    redirectToWorkspaceDetail(
      workspaceId,
      "error",
      "Add Supabase environment variables before creating approval requests.",
    );
  }

  const context = await getCurrentOrganizationContext();

  if (!context) {
    redirectToWorkspaceDetail(workspaceId, "error", "Could not resolve your organization context.");
  }

  const title = getString(formData, "title");
  const dueDate = getString(formData, "dueDate");
  const state = getString(formData, "state");

  if (!title) {
    redirectToWorkspaceDetail(workspaceId, "error", "Approval title is required.");
  }

  if (!approvalStates.includes(state as (typeof approvalStates)[number])) {
    redirectToWorkspaceDetail(workspaceId, "error", "Choose a valid approval state.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: workspace, error: workspaceError } = await supabase
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
    redirectToWorkspaceDetail(workspaceId, "error", "Workspace not found.");
  }

  const { error } = await supabase.from("approval_requests").insert({
    due_date: dueDate || null,
    requested_by: context.profileId,
    state,
    title,
    workspace_id: workspaceId,
  });

  if (error) {
    redirectToWorkspaceDetail(workspaceId, "error", error.message);
  }

  revalidatePath("/app");
  revalidatePath("/app/workspaces");
  revalidatePath(`/app/workspaces/${workspaceId}`);
  redirectToWorkspaceDetail(workspaceId, "message", "Approval request created.");
}
