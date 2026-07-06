import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { dashboardMetrics, marketingHighlights, phaseOnePreview } from "@/lib/mock";

export default function Home() {
  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 pb-16 pt-6 sm:px-8 lg:px-10">
        <section className="surface-panel overflow-hidden px-6 py-8 sm:px-10 sm:py-12">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.85fr] lg:items-center">
            <div className="space-y-8">
              <Badge tone="accent">Phase 1 Foundation Ready</Badge>
              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
                  A premium client portal foundation for agencies that need calm,
                  control, and visible polish.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                  AgencyFlow AI combines a clean public presence, a structured app shell,
                  and deployment-safe Supabase foundations so later phases can focus on
                  workflows instead of rework.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  href="/app"
                  size="lg"
                  className="min-w-[13rem] border border-[rgba(31,169,113,0.16)] bg-[var(--accent-soft)] text-[var(--accent-primary-hover)] shadow-none hover:bg-[var(--accent-soft-strong)]"
                >
                  Open app shell
                </Button>
                <Button
                  href="/signup"
                  size="lg"
                  className="min-w-[13rem] border border-[rgba(31,169,113,0.16)] bg-[var(--accent-soft)] text-[var(--accent-primary-hover)] shadow-none hover:bg-[var(--accent-soft-strong)]"
                >
                  Create workspace
                </Button>
                <Button
                  href="/features"
                  size="lg"
                  className="min-w-[13rem] border border-[rgba(31,169,113,0.16)] bg-[var(--accent-soft)] text-[var(--accent-primary-hover)] shadow-none hover:bg-[var(--accent-soft-strong)]"
                >
                  Explore modules
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {dashboardMetrics.map((metric) => (
                  <StatCard key={metric.label} {...metric} compact />
                ))}
              </div>
            </div>
            <Card className="grid-lines relative overflow-hidden p-6 sm:p-8">
              <div className="space-y-8">
                <div className="inline-flex max-w-full rounded-[24px] border border-white/80 bg-white/76 px-5 py-4 shadow-[0_18px_36px_rgba(16,24,40,0.05)] backdrop-blur-sm">
                  <Logo
                    variant="horizontal"
                    className="items-center gap-4 [&_.text-lg]:text-[1.9rem] [&_.text-xs]:tracking-[0.24em]"
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-hover)]">
                    Launch frame
                  </p>
                  <h2 className="max-w-md text-2xl font-semibold tracking-[-0.03em] sm:text-[2rem]">
                    The shell is already aligned with the product plan.
                  </h2>
                </div>
                <div className="space-y-4">
                  {phaseOnePreview.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[22px] border border-white/70 bg-white/80 p-4 shadow-[0_18px_32px_rgba(16,24,40,0.05)]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-[var(--text-primary)]">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                            {item.description}
                          </p>
                        </div>
                        <span className="pill pill-accent">{item.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {marketingHighlights.map((item) => (
            <Card key={item.title} className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary-hover)]">
                {item.eyebrow}
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                {item.description}
              </p>
            </Card>
          ))}
        </section>

        <section className="surface-card flex flex-col gap-4 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary-hover)]">
              Next steps
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              Phase 1 is set up to hand cleanly into the full product UI build.
            </h2>
          </div>
          <Link
            href="/app/settings"
            className="text-sm font-semibold text-[var(--accent-primary-hover)]"
          >
            Review appearance settings
          </Link>
        </section>
      </main>
    </div>
  );
}
