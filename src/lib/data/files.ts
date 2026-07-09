import { approvalSummary as fallbackApprovalSummary, fileFolders, uploadQueue, versionHistory, workspaceApprovals } from "@/lib/mock";
import { getCurrentOrganizationContext } from "@/lib/data/organization";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatShortDate, titleFromStage } from "@/lib/data/format";
import { splitAiText } from "@/lib/ai";

type FilesPageData = {
  approvalSummary: Array<{ label: string; value: number }>;
  aiInputSummary: string;
  folderCards: Array<{ count: string; name: string; status: string }>;
  latestReviewHelper: string[];
  uploadItems: Array<{ name: string; state: string; version: string }>;
  usingFallback: boolean;
  versionItems: Array<{ date: string; note: string; version: string }>;
  workspaceOptions: Array<{ id: string; name: string }>;
};

type ApprovalsPageData = {
  approvalSummary: Array<{ label: string; value: number }>;
  guidance: string[];
  requests: Array<{
    dueDate: string;
    id: string;
    reviewers: string;
    state: string;
    title: string;
    workspaceName: string;
  }>;
  usingFallback: boolean;
};

function firstRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export async function getFilesPageData(): Promise<FilesPageData> {
  const context = await getCurrentOrganizationContext();

  if (!context?.organizationId) {
    return {
      approvalSummary: fallbackApprovalSummary,
      aiInputSummary: [
        "Fallback file workflow",
        ...fileFolders.map((folder) => `${folder.name}: ${folder.status} with ${folder.count}`),
        ...uploadQueue.map((item) => `${item.name}: ${item.state} ${item.version}`),
      ].join("\n"),
      folderCards: fileFolders,
      latestReviewHelper: [
        "Review helper will come online once your organization has live deliverables and approvals.",
      ],
      uploadItems: uploadQueue,
      usingFallback: true,
      versionItems: versionHistory,
      workspaceOptions: [],
    };
  }

  const admin = createSupabaseAdminClient();
  const [workspaceResult, filesResult, versionsResult, approvalsResult, latestAiResult] = await Promise.all([
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
      .from("files")
      .select(
        `
          id,
          name,
          status,
          workspace_id,
          workspaces!inner (
            id,
            name,
            projects!inner (
              organization_id
            )
          )
        `,
      )
      .eq("workspaces.projects.organization_id", context.organizationId)
      .order("created_at", { ascending: false }),
    admin
      .from("file_versions")
      .select(
        `
          id,
          version_label,
          created_at,
          file_id,
          files!inner (
            name,
            workspace_id,
            workspaces!inner (
              projects!inner (
                organization_id
              )
            )
          )
        `,
      )
      .eq("files.workspaces.projects.organization_id", context.organizationId)
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("approval_requests")
      .select(
        `
          id,
          state,
          workspace_id,
          workspaces!inner (
            projects!inner (
              organization_id
            )
          )
        `,
      )
      .eq("workspaces.projects.organization_id", context.organizationId),
    admin
      .from("ai_generations")
      .select("output_text")
      .eq("organization_id", context.organizationId)
      .eq("prompt_type", "review_helper")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (workspaceResult.error || filesResult.error || versionsResult.error || approvalsResult.error) {
    return {
      approvalSummary: fallbackApprovalSummary,
      aiInputSummary: [
        "Fallback file workflow",
        ...fileFolders.map((folder) => `${folder.name}: ${folder.status} with ${folder.count}`),
        ...uploadQueue.map((item) => `${item.name}: ${item.state} ${item.version}`),
      ].join("\n"),
      folderCards: fileFolders,
      latestReviewHelper: [
        "Review helper will come online once your organization has live deliverables and approvals.",
      ],
      uploadItems: uploadQueue,
      usingFallback: true,
      versionItems: versionHistory,
      workspaceOptions: [],
    };
  }

  const workspaces = workspaceResult.data ?? [];
  const files = filesResult.data ?? [];
  const versions = versionsResult.data ?? [];
  const approvals = approvalsResult.data ?? [];
  const isClient = context.role === "client";

  const visibleWorkspaces = isClient ? [] : workspaces;
  const workspaceOptions = visibleWorkspaces.map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
  }));

  if (files.length === 0 && versions.length === 0) {
    return {
      approvalSummary: fallbackApprovalSummary,
      aiInputSummary: [
        "Fallback file workflow",
        ...fileFolders.map((folder) => `${folder.name}: ${folder.status} with ${folder.count}`),
        ...uploadQueue.map((item) => `${item.name}: ${item.state} ${item.version}`),
      ].join("\n"),
      folderCards: fileFolders,
      latestReviewHelper: [
        "Review helper will come online once your organization has live deliverables and approvals.",
      ],
      uploadItems: uploadQueue,
      usingFallback: true,
      versionItems: versionHistory,
      workspaceOptions,
    };
  }

  const folderCards = (isClient ? workspaces : visibleWorkspaces).slice(0, 3).map((workspace) => {
    const workspaceFiles = files.filter((item) => item.workspace_id === workspace.id);
    const pendingCount = workspaceFiles.filter((item) => item.status === "pending_review").length;

    return {
      count: `${workspaceFiles.length} files`,
      name: workspace.name,
      status:
        pendingCount > 0
          ? `${pendingCount} pending review`
          : workspaceFiles.length > 0
            ? "Up to date"
            : "Empty",
    };
  });

  const summaryLabels = [
    "pending_review",
    "needs_changes",
    "approved",
    "archived",
  ] as const;
  const aiInputSummary = [
    `Organization: ${context.organizationName}`,
    `Tracked workspaces: ${workspaces.length}`,
    `Files: ${files.length}`,
    `Versions: ${versions.length}`,
    `Approvals: ${approvals.length}`,
    ...files.slice(0, 5).map((file) => {
      const workspaceName = firstRelation(file.workspaces)?.name ?? "Workspace";
      return `${file.name} in ${workspaceName}: ${titleFromStage(file.status)}`;
    }),
    ...approvals.slice(0, 5).map((approval) => {
      return `Approval state: ${titleFromStage(approval.state)}`;
    }),
  ].join("\n");

  return {
    approvalSummary: summaryLabels.map((label) => ({
      label: titleFromStage(label),
      value: approvals.filter((item) => item.state === label).length,
    })),
    aiInputSummary,
    folderCards,
    latestReviewHelper: latestAiResult.data?.output_text
      ? splitAiText(latestAiResult.data.output_text)
      : [
          "Summaries stay tied to the current delivery queue instead of floating as generic advice.",
          "Use the helper after new uploads or before asking a client to review a mixed bundle.",
          "The biggest wins usually come from clarifying ownership and missing assets before approval starts.",
        ],
    uploadItems: files.slice(0, 6).map((item) => ({
      name: item.name,
      state: titleFromStage(item.status),
      version:
        versions.find((version) => version.file_id === item.id)?.version_label ?? "v1",
    })),
    usingFallback: false,
    versionItems: versions.map((item) => ({
      date: formatShortDate(item.created_at),
      note: `${firstRelation(item.files)?.name ?? "Deliverable"} uploaded to the live storage workflow.`,
      version: item.version_label,
    })),
    workspaceOptions,
  };
}

export async function getApprovalsPageData(): Promise<ApprovalsPageData> {
  const context = await getCurrentOrganizationContext();

  if (!context?.organizationId) {
    return {
      approvalSummary: fallbackApprovalSummary,
      guidance: [
        "Bundle mobile and desktop variants together so review feedback stays consolidated.",
        "Keep internal-only notes separate from client-facing comments before Phase 3 data wiring.",
        "Prepare concise AI-generated approval summaries for stakeholders who only need decision context.",
      ],
      requests: workspaceApprovals.map((item, index) => ({
        dueDate: index === 0 ? "Jul 16" : "TBD",
        id: `fallback-${index}`,
        reviewers: item.reviewers,
        state: item.state,
        title: item.item,
        workspaceName: "Fallback workspace",
      })),
      usingFallback: true,
    };
  }

  const admin = createSupabaseAdminClient();
  const [approvalsResult, reviewersResult] = await Promise.all([
    admin
      .from("approval_requests")
      .select(
        `
          id,
          title,
          state,
          due_date,
          workspaces!inner (
            name,
            projects!inner (
              organization_id
            )
          )
        `,
      )
      .eq("workspaces.projects.organization_id", context.organizationId)
      .order("created_at", { ascending: false }),
    admin
      .from("approval_reviewers")
      .select(
        `
          approval_request_id,
          profiles!inner (
            full_name
          ),
          approval_requests!inner (
            workspaces!inner (
              projects!inner (
                organization_id
              )
            )
          )
        `,
      )
      .eq("approval_requests.workspaces.projects.organization_id", context.organizationId),
  ]);

  if (approvalsResult.error || reviewersResult.error) {
    return {
      approvalSummary: fallbackApprovalSummary,
      guidance: [
        "Bundle mobile and desktop variants together so review feedback stays consolidated.",
        "Keep internal-only notes separate from client-facing comments before Phase 3 data wiring.",
        "Prepare concise AI-generated approval summaries for stakeholders who only need decision context.",
      ],
      requests: workspaceApprovals.map((item, index) => ({
        dueDate: index === 0 ? "Jul 16" : "TBD",
        id: `fallback-${index}`,
        reviewers: item.reviewers,
        state: item.state,
        title: item.item,
        workspaceName: "Fallback workspace",
      })),
      usingFallback: true,
    };
  }

  const requests = approvalsResult.data ?? [];
  const reviewers = reviewersResult.data ?? [];
  const counts = ["pending_review", "needs_changes", "approved", "archived"] as const;
  const isClient = context.role === "client";

  const visibleRequests = isClient
    ? requests.filter((item) => item.state !== "archived")
    : requests;

  if (visibleRequests.length === 0) {
    return {
      approvalSummary: counts.map((label) => ({
        label: titleFromStage(label),
        value: 0,
      })),
      guidance: [
        "The approvals route is now live and waiting for the first real review request.",
        "Create approval requests from a workspace or the files route to start the reviewer workflow.",
        "Later we can add comments, internal notes, and client-facing decision trails here.",
      ],
      requests: [],
      usingFallback: false,
    };
  }

  return {
    approvalSummary: counts.map((label) => ({
      label: titleFromStage(label),
      value: visibleRequests.filter((item) => item.state === label).length,
    })),
    guidance: [
      "Real approval state changes now persist, so this route can act as the central review queue.",
      "Reviewer names are pulled when assigned and otherwise show as awaiting assignment.",
      "The next useful layer here is comments plus client-safe visibility controls.",
    ],
    requests: visibleRequests.map((item) => {
      const matchingReviewers = reviewers
        .filter((reviewer) => reviewer.approval_request_id === item.id)
        .map((reviewer) => firstRelation(reviewer.profiles)?.full_name)
        .filter(Boolean);

      return {
        dueDate: item.due_date ? formatShortDate(item.due_date) : "TBD",
        id: item.id,
        reviewers:
          matchingReviewers.length > 0
            ? matchingReviewers.join(", ")
            : "Awaiting reviewer assignment",
        state: titleFromStage(item.state),
        title: item.title,
        workspaceName: firstRelation(item.workspaces)?.name ?? "Workspace",
      };
    }),
    usingFallback: false,
  };
}
