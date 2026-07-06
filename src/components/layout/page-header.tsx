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
    <section className="surface-panel px-6 py-7 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary-hover)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
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
