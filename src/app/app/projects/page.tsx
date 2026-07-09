import Link from "next/link";
import { createProjectAction } from "@/app/app/projects/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getProjectsBoardData } from "@/lib/data/projects";

type ProjectsPageProps = {
  searchParams: Promise<{
    error?: string;
    filter?: string;
    message?: string;
  }>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { error, filter, message } = await searchParams;
  const data = await getProjectsBoardData(filter ?? "all");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        title="A complete board view with filters, budgets, and workflow signals"
        description={
          data.usingFallback
            ? "This board is still using polished fallback columns until live project records are available."
            : "This board now reflects live organization project structure, grouped by actual stored stages."
        }
      />

      {message ? (
        <p className="rounded-[18px] border border-[rgba(31,169,113,0.18)] bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--accent-primary-hover)]">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-[18px] border border-[rgba(239,107,107,0.28)] bg-[rgba(239,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.24fr)_300px]">
        <div className="min-w-0 space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap gap-3">
              {data.filters.map((filterItem) => (
                <Link
                  key={filterItem.key}
                  href={filterItem.href}
                  className={`inline-flex h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors ${
                    filterItem.active
                      ? "border-[rgba(31,169,113,0.16)] bg-[var(--accent-soft)] text-[var(--accent-primary-hover)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {filterItem.label}
                </Link>
              ))}
            </div>
          </Card>

          <div className="max-w-full overflow-hidden rounded-[30px]">
            {data.boardColumns.length > 0 ? (
              <div className="scroll-row w-full pb-4">
                <div className="flex min-w-max gap-6 pr-3">
                  {data.boardColumns.map((column, columnIndex) => (
                    <Card key={`${column.title}-${columnIndex}`} className="w-[320px] p-4 xl:w-[332px]">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold tracking-[-0.03em]">{column.title}</h2>
                        <span className={`pill ${column.accent}`}>{column.cards.length}</span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {column.cards.map((card, cardIndex) => (
                          <div
                            key={`${card.name}-${card.client}-${card.due}-${cardIndex}`}
                            className="rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/30 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                {card.href ? (
                                  <Link href={card.href} className="font-semibold transition-colors hover:text-[var(--accent-primary-hover)]">
                                    {card.name}
                                  </Link>
                                ) : (
                                  <p className="font-semibold">{card.name}</p>
                                )}
                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                  {card.client}
                                </p>
                              </div>
                              <span className="pill pill-muted">{card.priority}</span>
                            </div>
                            <div className="mt-4">
                              <ProgressBar value={card.progress} />
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm text-[var(--text-secondary)]">
                              <span>{card.due}</span>
                              <span>{card.budget}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="p-6">
                <p className="text-lg font-semibold tracking-[-0.03em]">No projects match this filter yet</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                  Try another project view or create a new project that fits this stage or priority.
                </p>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary-hover)]">
              Board summary
            </p>
            <div className="mt-5 grid gap-3">
              {data.summary.map(([label, value], index) => (
                <div key={`${label}-${value}-${index}`} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                  <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary-hover)]">
              Create project
            </p>
            <form action={createProjectAction} className="mt-5 space-y-4">
              <Input label="Project name" name="name" placeholder="Northshore Rebrand" required />
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Summary</span>
                <textarea
                  className="min-h-28 w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-primary)]"
                  name="summary"
                  placeholder="Identity system, launch pages, approvals, and delivery notes."
                />
              </label>
              <div className="grid gap-4">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">Stage</span>
                  <select
                    className="h-12 w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)]"
                    defaultValue="backlog"
                    name="stage"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="in_progress">In progress</option>
                    <option value="review">Review</option>
                    <option value="approved">Approved</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </label>
                <Input label="Due date" name="dueDate" type="date" />
                <Input label="Budget (USD)" min="0" name="budget" placeholder="6200" step="0.01" type="number" />
              </div>
              <Button className="w-full" type="submit">
                Save project
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary-hover)]">
              AI insights
            </p>
            <div className="mt-5 space-y-3">
              {data.insights.map((insight, index) => (
                <div key={`${insight}-${index}`} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                  <p className="text-sm leading-7 text-[var(--text-secondary)]">{insight}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
