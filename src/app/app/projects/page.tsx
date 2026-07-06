import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ModalPreview } from "@/components/ui/modal-preview";
import { ProgressBar } from "@/components/ui/progress-bar";
import { projectFilters, projectInsights, projectsBoardColumns } from "@/lib/mock";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        title="A complete board view with filters, budgets, and workflow signals"
        description="The project pipeline now behaves like a polished product surface, with realistic card density, financial context, and AI bottleneck cues."
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_292px]">
        <div className="min-w-0 space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap gap-3">
              {projectFilters.map((filter, index) => (
                <Badge key={filter} tone={index === 0 ? "accent" : "muted"}>
                  {filter}
                </Badge>
              ))}
            </div>
          </Card>

          <div className="max-w-full overflow-hidden rounded-[28px]">
            <div className="scroll-row w-full pb-3">
              <div className="flex min-w-max gap-5 pr-2">
                {projectsBoardColumns.map((column) => (
                  <Card key={column.title} className="w-[296px] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-lg font-semibold tracking-[-0.03em]">{column.title}</h2>
                      <span className={`pill ${column.accent}`}>{column.cards.length}</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {column.cards.map((card) => (
                        <div
                          key={card.name}
                          className="rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]/30 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{card.name}</p>
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
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary-hover)]">
              Board summary
            </p>
            <div className="mt-5 grid gap-3">
              {[
                ["Projects in motion", "8"],
                ["Review-stage value", "$22.7k"],
                ["Next milestone due", "Jul 12"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                  <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary-hover)]">
              AI insights
            </p>
            <div className="mt-5 space-y-3">
              {projectInsights.map((insight) => (
                <div key={insight} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                  <p className="text-sm leading-7 text-[var(--text-secondary)]">{insight}</p>
                </div>
              ))}
            </div>
          </Card>

          <ModalPreview
            title="Create project"
            description="The future creation flow already has a clear modal style, button hierarchy, and premium spacing language."
          />
        </div>
      </section>
    </div>
  );
}
