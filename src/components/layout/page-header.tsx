import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  badgeLabel?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  badgeLabel,
}: PageHeaderProps) {
  return (
    <section className="surface-panel overflow-hidden px-6 py-7 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary-hover)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-balance text-[clamp(2rem,4vw,4rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
            {description}
          </p>
        </div>
        {badgeLabel ? <Badge tone="accent">{badgeLabel}</Badge> : null}
      </div>
    </section>
  );
}
