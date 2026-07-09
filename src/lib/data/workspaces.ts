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
import { splitAiText } from "@/lib/ai";

function firstRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

type WorkspaceDirectoryData = {
  projectOptions: Array<{
    id: string;
    name: string;
  }>;
  stats: typeof workspaceListStats;
  usingFallback: boolean;
  workspaces: typeof mockWorkspaces;
};

type WorkspaceDetailData = {
  aiInputSummary: string;
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
    return {
      projectOptions: [],
      stats: workspaceListStats,
      usingFallback: true,
      workspaces: mockWorkspaces,
    };
  }

  const supabase = await createSupabaseServerClient();
  const [workspacesResult, approvalsResult, tasksResult, projectsResult] = await Promise.all([
    supabase
      .from("workspaces")
      .select(
        `
          id,
          name,
          stage,
          summary,
          client_visible,
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
    supabase
      .from("projects")
      .select("id, name")
      .eq("organization_id", context.organizationId)
      .order("created_at", { ascending: false }),
  ]);

  if (workspacesResult.error || approvalsResult.error || tasksResult.error || projectsResult.error) {
    return {
      projectOptions: [],
      stats: workspaceListStats,
      usingFallback: true,
      workspaces: mockWorkspaces,
    };
  }

  const workspaces = workspacesResult.data ?? [];
  const isClient = context.role === "client";
  const visibleWorkspaces = isClient
    ? workspaces.filter((workspace) => workspace.client_visible)
    : workspaces;
  const projectOptions = (projectsResult.data ?? []).map((project) => ({
    id: project.id,
    name: project.name,
  }));

  if (!visibleWorkspaces.length) {
    return {
      projectOptions: isClient ? [] : projectOptions,
      stats: workspaceListStats,
      usingFallback: true,
      workspaces: mockWorkspaces,
    };
  }

  return {
    projectOptions,
    stats: [
      { label: "Live workspaces", value: String(visibleWorkspaces.length) },
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
    workspaces: visibleWorkspaces.map((workspace) => ({
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
      aiInputSummary: [
        `Workspace: ${fallbackWorkspace.name}`,
        `Client: ${fallbackWorkspace.client}`,
        `Stage: ${fallbackWorkspace.stage}`,
        `Summary: ${fallbackWorkspace.summary}`,
      ].join("\n"),
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
        client_visible,
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
      aiInputSummary: [
        `Workspace: ${fallbackWorkspace.name}`,
        `Client: ${fallbackWorkspace.client}`,
        `Stage: ${fallbackWorkspace.stage}`,
        `Summary: ${fallbackWorkspace.summary}`,
      ].join("\n"),
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

  if (context.role === "client" && !workspaceRow.client_visible) {
    return null;
  }

  const [milestonesResult, tasksResult, filesResult, approvalsResult, meetingNotesResult, latestAiResult] =
    await Promise.all([
      supabase
        .from("milestones")
        .select("name, status, due_date")
        .eq("workspace_id", workspaceId)
        .order("due_date", { ascending: true }),
      supabase
        .from("tasks")
        .select("title, state, client_visible")
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
      supabase
        .from("ai_generations")
        .select("output_text")
        .eq("organization_id", context.organizationId)
        .eq("prompt_type", "workspace_update")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
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
  const aiInputSummary = [
    `Workspace: ${workspace.name}`,
    `Client: ${workspace.client}`,
    `Stage: ${workspace.stage}`,
    `Summary: ${workspace.summary}`,
    ...(milestonesResult.data ?? []).slice(0, 4).map((item) => `${item.name}: ${item.status ?? "Pending"} due ${formatShortDate(item.due_date)}`),
    ...(tasksResult.data ?? []).slice(0, 4).map((task) => `${task.title}: ${titleFromStage(task.state)}`),
    ...(approvalsResult.data ?? []).slice(0, 4).map((item) => `${item.title}: ${titleFromStage(item.state)}`),
  ].join("\n");

  return {
    aiInputSummary,
    workspace,
    workspaceAiCopilot:
      latestAiResult.data?.output_text
        ? splitAiText(latestAiResult.data.output_text)
        : (meetingNotesResult.data ?? []).length > 0
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
      (tasksResult.data ?? []).filter((task) =>
        context.role === "client" ? task.client_visible : true,
      ).length > 0
        ? (tasksResult.data ?? [])
            .filter((task) => (context.role === "client" ? task.client_visible : true))
            .map((task) => ({
            title: task.title,
            assignee: context.organizationName,
            state: titleFromStage(task.state),
          }))
        : workspaceTasks,
    usingFallback: false,
  };
}
