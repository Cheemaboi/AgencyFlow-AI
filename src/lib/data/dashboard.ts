import {
  aiBrief,
  dashboardMetrics,
  overviewTasks,
  projectHealth,
  quickActions,
  recentActivity,
  recentFiles,
  revenueByClient,
  upcomingMeetings,
} from "@/lib/mock";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  formatCompactCurrencyFromCents,
  formatShortDate,
  titleFromStage,
} from "@/lib/data/format";
import { getCurrentOrganizationContext } from "@/lib/data/organization";
import { splitAiText } from "@/lib/ai";

type DashboardData = {
  aiBrief: string[];
  aiInputSummary: string;
  dashboardMetrics: typeof dashboardMetrics;
  organizationName?: string;
  overviewTasks: typeof overviewTasks;
  projectHealth: typeof projectHealth;
  quickActions: string[];
  recentActivity: typeof recentActivity;
  recentFiles: typeof recentFiles;
  revenueByClient: typeof revenueByClient;
  upcomingMeetings: typeof upcomingMeetings;
  usingFallback: boolean;
};

function fallbackDashboardData(): DashboardData {
  return {
    aiBrief,
    aiInputSummary: [
      "Organization: AgencyFlow AI",
      ...dashboardMetrics.map((metric) => `${metric.label}: ${metric.value} (${metric.helper})`),
      ...projectHealth.map((project) => `${project.name}: ${project.status} at ${project.progress}%`),
      ...aiBrief,
    ].join("\n"),
    dashboardMetrics,
    overviewTasks,
    projectHealth,
    quickActions,
    recentActivity,
    recentFiles,
    revenueByClient,
    upcomingMeetings,
    usingFallback: true,
  };
}

function buildRevenueMix(organizationName: string, projectNames: string[]) {
  if (projectNames.length <= 1) {
    const orgShort = organizationName.split(" ")[0] || "Primary";

    return [
      { client: orgShort, value: 38 },
      { client: "Pipeline", value: 24 },
      { client: "Review", value: 21 },
      { client: "Other", value: 17 },
    ];
  }

  return projectNames.slice(0, 4).map((name, index) => ({
    client: index === 0 ? organizationName.split(" ")[0] : name.split(" ")[0],
    value: Math.max(12, 38 - index * 8),
  }));
}

export async function getDashboardData(): Promise<DashboardData> {
  const context = await getCurrentOrganizationContext();

  if (!context) {
    return fallbackDashboardData();
  }

  const supabase = await createSupabaseServerClient();
  const [projectsResult, tasksResult, approvalsResult, invoicesResult, filesResult, activityResult, latestAiResult] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, name, stage, budget_cents, due_date")
        .eq("organization_id", context.organizationId)
        .order("created_at", { ascending: false }),
      supabase
        .from("tasks")
        .select("title, description, state, due_date")
        .order("due_date", { ascending: true })
        .limit(3),
      supabase
        .from("approval_requests")
        .select("title, state, due_date")
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("invoices")
        .select("status, amount_cents, due_date")
        .eq("organization_id", context.organizationId)
        .order("due_date", { ascending: true }),
      supabase
        .from("files")
        .select("name, file_type, status, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("activity_logs")
        .select("action, entity_type, created_at")
        .eq("organization_id", context.organizationId)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("ai_generations")
        .select("output_text")
        .eq("organization_id", context.organizationId)
        .eq("prompt_type", "dashboard_summary")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (
    projectsResult.error ||
    tasksResult.error ||
    approvalsResult.error ||
    invoicesResult.error ||
    filesResult.error ||
    activityResult.error
  ) {
    return fallbackDashboardData();
  }

  const projects = projectsResult.data ?? [];
  const tasks = tasksResult.data ?? [];
  const approvals = approvalsResult.data ?? [];
  const invoices = invoicesResult.data ?? [];
  const files = filesResult.data ?? [];
  const activityLogs = activityResult.data ?? [];

  if (!projects.length && !tasks.length && !approvals.length && !invoices.length) {
    return fallbackDashboardData();
  }

  const dueInvoices = invoices.filter((invoice) => invoice.status === "due");
  const totalInvoiceAmount = invoices.reduce(
    (sum, invoice) => sum + (invoice.amount_cents ?? 0),
    0,
  );
  const activeProjectCount = projects.filter(
    (project) => project.stage !== "delivered",
  ).length;

  const generatedProjectHealth = projects.slice(0, 3).map((project, index) => ({
    name: project.name,
    owner: `Org: ${context.organizationName}`,
    status: titleFromStage(project.stage),
    progress: Math.max(18, 82 - index * 12),
  }));

  const generatedRevenueMix = buildRevenueMix(
    context.organizationName,
    projects.map((project) => project.name),
  );

  const generatedAiBrief = approvals.slice(0, 3).map((approval) => {
    const dueText = approval.due_date
      ? ` due ${formatShortDate(approval.due_date)}`
      : "";

    return `${approval.title} is currently ${titleFromStage(approval.state).toLowerCase()}${dueText}.`;
  });

  const generatedRecentActivity = activityLogs.slice(0, 4).map((entry) => ({
    title: titleFromStage(entry.action),
    detail: `${titleFromStage(entry.entity_type)} activity recorded in the organization log`,
    time: formatShortDate(entry.created_at),
  }));

  const generatedRecentFiles = files.slice(0, 3).map((file) => ({
    name: file.name,
    size: file.file_type ?? "Tracked file",
    status: titleFromStage(file.status),
  }));

  const generatedTasks = tasks.slice(0, 3).map((task) => ({
    title: task.title,
    time: task.due_date ? formatShortDate(task.due_date) : "Upcoming",
    owner: context.organizationName,
    description: task.description ?? `Current task state: ${titleFromStage(task.state)}.`,
  }));
  const aiInputSummary = [
    `Organization: ${context.organizationName}`,
    `Projects: ${projects.length}`,
    `Active projects: ${activeProjectCount}`,
    `Pending approvals: ${approvals.filter((approval) => approval.state === "pending_review").length}`,
    `Due invoices: ${dueInvoices.length}`,
    `Tracked revenue: ${formatCompactCurrencyFromCents(totalInvoiceAmount)}`,
    ...projects.slice(0, 4).map((project) => {
      const budget = formatCompactCurrencyFromCents(project.budget_cents ?? 0);
      return `${project.name}: ${titleFromStage(project.stage)} with budget ${budget} due ${project.due_date ? formatShortDate(project.due_date) : "TBD"}`;
    }),
    ...approvals.slice(0, 3).map((approval) => {
      return `${approval.title}: ${titleFromStage(approval.state)} due ${approval.due_date ? formatShortDate(approval.due_date) : "TBD"}`;
    }),
  ].join("\n");

  return {
    aiBrief: latestAiResult.data?.output_text
      ? splitAiText(latestAiResult.data.output_text)
      : generatedAiBrief.length
        ? generatedAiBrief
        : aiBrief,
    aiInputSummary,
    dashboardMetrics: [
      {
        label: "Active projects",
        value: String(activeProjectCount).padStart(2, "0"),
        helper: `Across ${projects.length} tracked projects`,
      },
      {
        label: "Pending approvals",
        value: String(
          approvals.filter((approval) => approval.state === "pending_review").length,
        ).padStart(2, "0"),
        helper: "Approval queue across current workspaces",
      },
      {
        label: "Invoices due",
        value: formatCompactCurrencyFromCents(
          dueInvoices.reduce((sum, invoice) => sum + (invoice.amount_cents ?? 0), 0),
        ),
        helper: `${dueInvoices.length} invoices currently in due status`,
      },
      {
        label: "Tracked revenue",
        value: formatCompactCurrencyFromCents(totalInvoiceAmount),
        helper: "Current invoice volume across the organization",
      },
    ],
    organizationName: context.organizationName,
    overviewTasks: generatedTasks.length ? generatedTasks : overviewTasks,
    projectHealth: generatedProjectHealth.length ? generatedProjectHealth : projectHealth,
    quickActions,
    recentActivity: generatedRecentActivity.length ? generatedRecentActivity : recentActivity,
    recentFiles: generatedRecentFiles.length ? generatedRecentFiles : recentFiles,
    revenueByClient: generatedRevenueMix.length ? generatedRevenueMix : revenueByClient,
    upcomingMeetings: upcomingMeetings.map((meeting, index) => ({
      ...meeting,
      title:
        approvals[index]?.title ??
        meeting.title,
    })),
    usingFallback: false,
  };
}
