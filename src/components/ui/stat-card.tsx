import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  compact?: boolean;
};

export function StatCard({ label, value, helper, compact = false }: StatCardProps) {
  return (
    <Card className={compact ? "p-5" : "p-6"}>
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-primary)]" />
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
          {label}
        </p>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{value}</p>
      <p className="mt-3 max-w-[18rem] text-sm leading-6 text-[var(--text-secondary)]">{helper}</p>
    </Card>
  );
}
