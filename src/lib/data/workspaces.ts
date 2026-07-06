import {
  mockWorkspaces,
  workspaceAiCopilot,
  workspaceApprovals,
  workspaceDeliverables,
  workspaceFeedback,
  workspaceListStats,
  workspaceMilestones,
  workspaceTasks,
} from "@/lib/mock";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatShortDate, titleFromStage } from "@/lib/data/format";
import { getCurrentOrganizationContext } from "@/lib/data/organization";

function firstRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

type WorkspaceDirectoryData = {
  stats: typeof workspaceListStats;
  usingFallback: boolean;
  workspaces: typeof mockWorkspaces;
};

type WorkspaceDetailData = {
  workspace: (typeof mockWorkspaces)[number];
  workspaceAiCopilot: string[];
  workspaceApprovals: typeof workspaceApprovals;
  workspaceDeliverables: typeof workspaceDeliverables;
  workspaceFeedback: typeof workspaceFeedback;
  workspaceMilestones: typeof workspaceMilestones;
  workspaceTasks: typeof workspaceTasks;
  usingFallback: boolean;
};

export async function getWorkspaceDirectoryData(): Promise<WorkspaceDirectoryData> {
  const context = await getCurrentOrganizationContext();

  if (!context) {
    return { stats: workspaceListStats, usingFallback: true, workspaces: mockWorkspaces };
  }

  const supabase = await createSupabaseServerClient();
  const [workspacesResult, approvalsResult, tasksResult] = await Promise.all([
    supabase
      .from("workspaces")
      .select(
        `
          id,
          name,
          stage,
          summary,
          projects (
            clients (
              name
            )
          )
        `,
      )
      .order("created_at", { ascending: false }),
    supabase.from("approval_requests").select("id, state"),
    supabase.from("tasks").select("id, state"),
  ]);

  if (workspacesResult.error || approvalsResult.error || tasksResult.error) {
    return { stats: workspaceListStats, usingFallback: true, workspaces: mockWorkspaces };
  }

  const workspaces = workspacesResult.data ?? [];

  if (!workspaces.length) {
    return { stats: workspaceListStats, usingFallback: true, workspaces: mockWorkspaces };
  }

  return {
    stats: [
      { label: "Live workspaces", value: String(workspaces.length) },
      {
        label: "Client-visible approvals",
        value: String(
          (approvalsResult.data ?? []).filter((item) => item.state === "pending_review").length,
        ),
      },
      {
        label: "Open tasks",
        value: String(
          (tasksResult.data ?? []).filter((item) => item.state !== "done").length,
        ),
      },
    ],
    usingFallback: false,
    workspaces: workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      client:
        firstRelation(firstRelation(workspace.projects)?.clients)?.name ??
        context.organizationName,
      stage: titleFromStage(workspace.stage),
      summary:
        workspace.summary ??
        "Workspace connected to the live Supabase data model and ready for richer workflows.",
    })),
  };
}

export async function getWorkspaceDetailData(
  workspaceId: string,
): Promise<WorkspaceDetailData | null> {
  const context = await getCurrentOrganizationContext();

  if (!context) {
    const fallbackWorkspace = mockWorkspaces.find((item) => item.id === workspaceId);

    if (!fallbackWorkspace) {
      return null;
    }

    return {
      workspace: fallbackWorkspace,
      workspaceAiCopilot,
      workspaceApprovals,
      workspaceDeliverables,
      workspaceFeedback,
      workspaceMilestones,
      workspaceTasks,
      usingFallback: true,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: workspaceRow, error: workspaceError } = await supabase
    .from("workspaces")
    .select(
      `
        id,
        name,
        stage,
        summary,
        projects (
          organization_id,
          clients (
            name
          )
        )
      `,
    )
    .eq("id", workspaceId)
    .maybeSingle();

  if (workspaceError || !workspaceRow) {
    const fallbackWorkspace = mockWorkspaces.find((item) => item.id === workspaceId);

    if (!fallbackWorkspace) {
      return null;
    }

    return {
      workspace: fallbackWorkspace,
      workspaceAiCopilot,
      workspaceApprovals,
      workspaceDeliverables,
      workspaceFeedback,
      workspaceMilestones,
      workspaceTasks,
      usingFallback: true,
    };
  }

  const [milestonesResult, tasksResult, filesResult, approvalsResult, meetingNotesResult] =
    await Promise.all([
      supabase
        .from("milestones")
        .select("name, status, due_date")
        .eq("workspace_id", workspaceId)
        .order("due_date", { ascending: true }),
      supabase
        .from("tasks")
        .select("title, state")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),
      supabase
        .from("files")
        .select("name, file_type, status")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),
      supabase
        .from("approval_requests")
        .select("title, state")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),
      supabase
        .from("meeting_notes")
        .select("title, summary")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  const workspace = {
    id: workspaceRow.id,
    name: workspaceRow.name,
    client:
      firstRelation(firstRelation(workspaceRow.projects)?.clients)?.name ??
      context.organizationName,
    stage: titleFromStage(workspaceRow.stage),
    summary:
      workspaceRow.summary ??
      "This workspace is now being served from real data with fallback-safe presentation.",
  };

  return {
    workspace,
    workspaceAiCopilot:
      (meetingNotesResult.data ?? []).length > 0
        ? (meetingNotesResult.data ?? []).map(
            (note) => `${note.title}: ${note.summary ?? "Meeting summary ready for follow-up."}`,
          )
        : workspaceAiCopilot,
    workspaceApprovals:
      (approvalsResult.data ?? []).length > 0
        ? (approvalsResult.data ?? []).map((item) => ({
            item: item.title,
            reviewers: "Assigned reviewers",
            state: titleFromStage(item.state),
          }))
        : workspaceApprovals,
    workspaceDeliverables:
      (filesResult.data ?? []).length > 0
        ? (filesResult.data ?? []).map((item) => ({
            name: item.name,
            type: item.file_type ?? "Asset",
            status: titleFromStage(item.status),
          }))
        : workspaceDeliverables,
    workspaceFeedback,
    workspaceMilestones:
      (milestonesResult.data ?? []).length > 0
        ? (milestonesResult.data ?? []).map((item) => ({
            name: item.name,
            due: formatShortDate(item.due_date),
            status: item.status ?? "Pending",
          }))
        : workspaceMilestones,
    workspaceTasks:
      (tasksResult.data ?? []).length > 0
        ? (tasksResult.data ?? []).map((task) => ({
            title: task.title,
            assignee: context.organizationName,
            state: titleFromStage(task.state),
          }))
        : workspaceTasks,
    usingFallback: false,
  };
}
