import {
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
  boardColumns: Array<{
    accent: string;
    cards: Array<{
      budget: string;
      client: string;
      due: string;
      href: string | null;
      name: string;
      priority: string;
      progress: number;
    }>;
    title: string;
  }>;
  filters: Array<{
    active: boolean;
    href: string;
    key: string;
    label: string;
  }>;
  insights: string[];
  summary: Array<[string, string]>;
  usingFallback: boolean;
};

const filterOptions = [
  { key: "all", label: "All projects" },
  { key: "month", label: "This month" },
  { key: "high", label: "High priority" },
  { key: "review", label: "Needs review" },
  { key: "approved", label: "Approved" },
  { key: "delivered", label: "Delivered" },
] as const;

function buildFallbackBoardColumns(): ProjectsBoardData["boardColumns"] {
  return projectsBoardColumns.map((column) => ({
    accent: column.accent,
    cards: column.cards.map((card) => ({
      budget: card.budget,
      client: card.client,
      due: card.due,
      href: null,
      name: card.name,
      priority: card.priority,
      progress: card.progress,
    })),
    title: column.title,
  }));
}

function filterFallbackBoardColumns(activeFilter: string) {
  if (activeFilter === "all") {
    return buildFallbackBoardColumns();
  }

  const filtered = buildFallbackBoardColumns()
    .map((column) => {
      const cards = column.cards.filter((card) => {
        if (activeFilter === "high") {
          return card.priority === "High";
        }

        if (activeFilter === "review") {
          return column.title === "Review";
        }

        if (activeFilter === "approved") {
          return column.title === "Approved";
        }

        if (activeFilter === "delivered") {
          return column.title === "Delivered";
        }

        if (activeFilter === "month") {
          return card.due.includes("Jul");
        }

        return true;
      });

      return {
        ...column,
        cards,
      };
    })
    .filter((column) => column.cards.length > 0);

  return filtered.length > 0 ? filtered : buildFallbackBoardColumns();
}

function buildProjectFilters(activeFilter: string) {
  return filterOptions.map((filter) => ({
    active: filter.key === activeFilter,
    href: filter.key === "all" ? "/app/projects" : `/app/projects?filter=${filter.key}`,
    key: filter.key,
    label: filter.label,
  }));
}

function matchesFilter(
  filter: string,
  project: {
    due_date: string | null;
    stage: string | null;
  },
  priority: string,
) {
  if (filter === "all") {
    return true;
  }

  if (filter === "high") {
    return priority === "High";
  }

  if (filter === "review") {
    return project.stage === "review";
  }

  if (filter === "approved") {
    return project.stage === "approved";
  }

  if (filter === "delivered") {
    return project.stage === "delivered";
  }

  if (filter === "month") {
    if (!project.due_date) {
      return false;
    }

    const parsed = new Date(project.due_date);
    const now = new Date();

    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.getUTCFullYear() === now.getUTCFullYear() &&
      parsed.getUTCMonth() === now.getUTCMonth()
    );
  }

  return true;
}

export async function getProjectsBoardData(activeFilter = "all"): Promise<ProjectsBoardData> {
  const context = await getCurrentOrganizationContext();

  if (!context) {
    return {
      boardColumns: filterFallbackBoardColumns(activeFilter),
      filters: buildProjectFilters(activeFilter),
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
        workspaces (
          id,
          client_visible
        ),
        clients (
          name
        )
      `,
    )
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false });

  if (error || !projects || projects.length === 0) {
    return {
      boardColumns: filterFallbackBoardColumns(activeFilter),
      filters: buildProjectFilters(activeFilter),
      insights: projectInsights,
      summary: [
        ["Projects in motion", "8"],
        ["Review-stage value", "$22.7k"],
        ["Next milestone due", "Jul 12"],
      ],
      usingFallback: true,
    };
  }

  const isClient = context.role === "client";
  const visibleProjects = isClient
    ? projects.filter((project) =>
        (project.workspaces ?? []).some((workspace) => workspace.client_visible),
      )
    : projects;

  if (visibleProjects.length === 0) {
    return {
      boardColumns: filterFallbackBoardColumns(activeFilter),
      filters: buildProjectFilters(activeFilter),
      insights: projectInsights,
      summary: [
        ["Projects in motion", "0"],
        ["Review-stage value", "$0"],
        ["Next milestone due", "TBD"],
      ],
      usingFallback: true,
    };
  }

  const stageOrder = ["backlog", "in_progress", "review", "approved", "delivered"] as const;
  const boardColumns = stageOrder.map((stage) => {
    const cards = visibleProjects
      .filter((project) => project.stage === stage)
      .map((project, index) => {
        const visibleWorkspace = isClient
          ? (project.workspaces ?? []).find((workspace) => workspace.client_visible)
          : firstRelation(project.workspaces);

        const priority = index === 0 ? "High" : index === 1 ? "Medium" : "Low";

        return {
          budget: formatCompactCurrencyFromCents(project.budget_cents),
          client: firstRelation(project.clients)?.name ?? context.organizationName,
          due: formatShortDate(project.due_date),
          href: visibleWorkspace?.id
            ? `/app/workspaces/${visibleWorkspace.id}`
            : null,
          include: matchesFilter(activeFilter, project, priority),
          name: project.name,
          priority,
          progress: Math.max(12, 84 - index * 14),
        };
      })
      .filter((card) => card.include)
      .map((card) => {
        const { include, ...rest } = card;
        void include;
        return rest;
      });

    return {
      title: titleFromStage(stage),
      accent: stage === "backlog" || stage === "delivered" ? "pill-muted" : "pill-accent",
      cards,
    };
  }).filter((column) => activeFilter === "all" || column.cards.length > 0);

  const reviewProjects = visibleProjects.filter((project) => project.stage === "review");
  const activeProjects = visibleProjects.filter((project) => project.stage !== "delivered");
  const nextDue = visibleProjects.find((project) => project.due_date);

  return {
    boardColumns,
    filters: buildProjectFilters(activeFilter),
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
