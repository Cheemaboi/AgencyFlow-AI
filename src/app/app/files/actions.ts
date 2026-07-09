"use server";

import { randomUUID } from "node:crypto";
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

function redirectWithMessage(message: string): never {
  redirect(buildRedirectUrl("/app/files", { message }));
}

function redirectWithError(error: string): never {
  redirect(buildRedirectUrl("/app/files", { error }));
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
}

async function ensureDeliverablesBucket() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.getBucket("deliverables");

  if (!error && data) {
    return admin;
  }

  if (error && !/not found/i.test(error.message)) {
    throw new Error(error.message);
  }

  const { error: createError } = await admin.storage.createBucket("deliverables", {
    public: false,
  });

  if (createError && !/already exists/i.test(createError.message)) {
    throw new Error(createError.message);
  }

  return admin;
}

export async function uploadDeliverableAction(formData: FormData) {
  await requireAuthenticatedUser("/app/files");

  if (!hasSupabaseEnv) {
    redirectWithError("Add Supabase environment variables before uploading deliverables.");
  }

  const context = await getCurrentOrganizationContext();

  if (!context?.organizationId || !context.profileId) {
    redirectWithError("Could not resolve your organization context.");
  }

  const workspaceId = getString(formData, "workspaceId");
  const requestedState = getString(formData, "status") || "pending_review";
  const incomingFile = formData.get("file");

  if (!workspaceId) {
    redirectWithError("Choose a workspace before uploading.");
  }

  if (!(incomingFile instanceof File) || incomingFile.size === 0) {
    redirectWithError("Attach a file before uploading.");
  }

  const admin = await ensureDeliverablesBucket().catch((error: unknown) =>
    redirectWithError(
      error instanceof Error ? error.message : "Could not prepare the deliverables bucket.",
    ),
  );

  const { data: workspace, error: workspaceError } = await admin
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
    .eq("id", workspaceId)
    .eq("projects.organization_id", context.organizationId)
    .maybeSingle();

  if (workspaceError || !workspace) {
    redirectWithError("That workspace does not belong to your organization.");
  }

  const sanitizedName = sanitizeFileName(incomingFile.name);
  const { data: existingFile } = await admin
    .from("files")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("name", incomingFile.name)
    .maybeSingle();

  const fileId = existingFile?.id ?? randomUUID();

  const { data: existingVersions } = await admin
    .from("file_versions")
    .select("id")
    .eq("file_id", fileId);

  const versionNumber = (existingVersions?.length ?? 0) + 1;
  const versionLabel = `v${versionNumber}`;
  const storagePath = `${context.organizationId}/${workspaceId}/${fileId}/${versionLabel}-${sanitizedName}`;

  const { error: uploadError } = await admin.storage
    .from("deliverables")
    .upload(storagePath, incomingFile, {
      contentType: incomingFile.type || undefined,
      upsert: false,
    });

  if (uploadError) {
    redirectWithError(uploadError.message);
  }

  if (!existingFile) {
    const { error: fileInsertError } = await admin.from("files").insert({
      id: fileId,
      file_type: incomingFile.type || null,
      name: incomingFile.name,
      status: requestedState,
      storage_path: storagePath,
      uploaded_by: context.profileId,
      workspace_id: workspaceId,
    });

    if (fileInsertError) {
      redirectWithError(fileInsertError.message);
    }
  } else {
    const { error: fileUpdateError } = await admin
      .from("files")
      .update({
        file_type: incomingFile.type || null,
        status: requestedState,
        storage_path: storagePath,
        uploaded_by: context.profileId,
      })
      .eq("id", fileId);

    if (fileUpdateError) {
      redirectWithError(fileUpdateError.message);
    }
  }

  const { error: versionError } = await admin.from("file_versions").insert({
    file_id: fileId,
    storage_path: storagePath,
    uploaded_by: context.profileId,
    version_label: versionLabel,
  });

  if (versionError) {
    redirectWithError(versionError.message);
  }

  revalidatePath("/app");
  revalidatePath("/app/files");
  revalidatePath("/app/approvals");
  revalidatePath("/app/workspaces");
  redirectWithMessage(`Uploaded ${incomingFile.name} as ${versionLabel}.`);
}

export async function updateApprovalStateAction(formData: FormData) {
  await requireAuthenticatedUser("/app/approvals");

  if (!hasSupabaseEnv) {
    redirect(buildRedirectUrl("/app/approvals", { error: "Add Supabase environment variables before updating approvals." }));
  }

  const context = await getCurrentOrganizationContext();

  if (!context?.organizationId) {
    redirect(buildRedirectUrl("/app/approvals", { error: "Could not resolve your organization context." }));
  }

  const approvalId = getString(formData, "approvalId");
  const state = getString(formData, "state");

  if (!approvalId || !state) {
    redirect(buildRedirectUrl("/app/approvals", { error: "Approval id and state are required." }));
  }

  const admin = createSupabaseAdminClient();
  const { data: approval, error: approvalError } = await admin
    .from("approval_requests")
    .select(
      `
        id,
        workspaces!inner (
          projects!inner (
            organization_id
          )
        )
      `,
    )
    .eq("id", approvalId)
    .eq("workspaces.projects.organization_id", context.organizationId)
    .maybeSingle();

  if (approvalError || !approval) {
    redirect(buildRedirectUrl("/app/approvals", { error: "Approval request not found." }));
  }

  const { error } = await admin
    .from("approval_requests")
    .update({ state })
    .eq("id", approvalId);

  if (error) {
    redirect(buildRedirectUrl("/app/approvals", { error: error.message }));
  }

  revalidatePath("/app");
  revalidatePath("/app/files");
  revalidatePath("/app/approvals");
  revalidatePath("/app/workspaces");
  redirect(buildRedirectUrl("/app/approvals", { message: "Approval state updated." }));
}
