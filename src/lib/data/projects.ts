import {
  projectFilters,
  projectInsights,
  projectsBoardColumns,
} from "@/lib/mock";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  formatCompactCurrencyFromCents,
  formatShortDate,
  titleFromStage,
} from "@/lib/data/format";
import { getCurrentOrganizationContext } from "@/lib/data/organization";

function firstRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

type ProjectsBoardData = {
  boardColumns: typeof projectsBoardColumns;
  filters: string[];
  insights: string[];
  summary: Array<[string, string]>;
  usingFallback: boolean;
};

export async function getProjectsBoardData(): Promise<ProjectsBoardData> {
  const context = await getCurrentOrganizationContext();

  if (!context) {
    return {
      boardColumns: projectsBoardColumns,
      filters: projectFilters,
      insights: projectInsights,
      summary: [
        ["Projects in motion", "8"],
        ["Review-stage value", "$22.7k"],
        ["Next milestone due", "Jul 12"],
      ],
      usingFallback: true,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      `
        id,
        name,
        stage,
        due_date,
        budget_cents,
        clients (
          name
        )
      `,
    )
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false });

  if (error || !projects || projects.length === 0) {
    return {
      boardColumns: projectsBoardColumns,
      filters: projectFilters,
      insights: projectInsights,
      summary: [
        ["Projects in motion", "8"],
        ["Review-stage value", "$22.7k"],
        ["Next milestone due", "Jul 12"],
      ],
      usingFallback: true,
    };
  }

  const stageOrder = ["backlog", "in_progress", "review", "approved", "delivered"] as const;
  const boardColumns = stageOrder.map((stage) => {
    const cards = projects
      .filter((project) => project.stage === stage)
      .map((project, index) => ({
        name: project.name,
        client: firstRelation(project.clients)?.name ?? context.organizationName,
        due: formatShortDate(project.due_date),
        progress: Math.max(12, 84 - index * 14),
        priority: index === 0 ? "High" : index === 1 ? "Medium" : "Low",
        budget: formatCompactCurrencyFromCents(project.budget_cents),
      }));

    return {
      title: titleFromStage(stage),
      accent: stage === "backlog" || stage === "delivered" ? "pill-muted" : "pill-accent",
      cards,
    };
  });

  const reviewProjects = projects.filter((project) => project.stage === "review");
  const activeProjects = projects.filter((project) => project.stage !== "delivered");
  const nextDue = projects.find((project) => project.due_date);

  return {
    boardColumns,
    filters: projectFilters,
    insights: [
      `${reviewProjects.length} projects are currently in review, which makes approvals the clearest near-term bottleneck.`,
      `${activeProjects.length} projects are active across ${context.organizationName}.`,
      "This board is now ready to take real CRUD and status updates instead of mock-only state.",
    ],
    summary: [
      ["Projects in motion", String(activeProjects.length)],
      [
        "Review-stage value",
        formatCompactCurrencyFromCents(
          reviewProjects.reduce((sum, project) => sum + (project.budget_cents ?? 0), 0),
        ),
      ],
      ["Next milestone due", nextDue?.due_date ? formatShortDate(nextDue.due_date) : "TBD"],
    ],
    usingFallback: false,
  };
}
