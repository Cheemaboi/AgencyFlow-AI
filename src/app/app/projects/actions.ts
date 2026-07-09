"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildRedirectUrl } from "@/lib/auth/redirects";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getCurrentOrganizationContext } from "@/lib/data/organization";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const projectStages = ["backlog", "in_progress", "review", "approved", "delivered"] as const;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(message: string): never {
  redirect(
    buildRedirectUrl("/app/projects", {
      message,
    }),
  );
}

function redirectWithError(error: string): never {
  redirect(
    buildRedirectUrl("/app/projects", {
      error,
    }),
  );
}

function toBudgetCents(value: string) {
  if (!value) {
    return null;
  }

  const amount = Number(value);

  if (Number.isNaN(amount) || amount < 0) {
    return Number.NaN;
  }

  return Math.round(amount * 100);
}

export async function createProjectAction(formData: FormData) {
  await requireAuthenticatedUser("/app/projects");

  if (!hasSupabaseEnv) {
    redirectWithError("Add Supabase environment variables before creating live projects.");
  }

  const context = await getCurrentOrganizationContext();

  if (!context) {
    redirectWithError("Could not resolve your organization context.");
  }

  const name = getString(formData, "name");
  const summary = getString(formData, "summary");
  const stage = getString(formData, "stage");
  const dueDate = getString(formData, "dueDate");
  const budget = getString(formData, "budget");

  if (!name) {
    redirectWithError("Project name is required.");
  }

  if (!projectStages.includes(stage as (typeof projectStages)[number])) {
    redirectWithError("Choose a valid project stage.");
  }

  const budgetCents = toBudgetCents(budget);

  if (Number.isNaN(budgetCents)) {
    redirectWithError("Budget must be a valid positive number.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("projects").insert({
    budget_cents: budgetCents,
    due_date: dueDate || null,
    name,
    organization_id: context.organizationId,
    stage,
    summary: summary || null,
  });

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/app");
  revalidatePath("/app/projects");
  revalidatePath("/app/workspaces");
  redirectWithMessage("Project created.");
}
