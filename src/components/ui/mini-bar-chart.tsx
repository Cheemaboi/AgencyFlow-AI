type MiniBarChartProps = {
  items: Array<{ label: string; value: number }>;
  suffix?: string;
};

export function MiniBarChart({ items, suffix = "" }: MiniBarChartProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-4">
          <span className="w-[10.5rem] shrink-0 text-sm font-semibold leading-5 text-[var(--text-secondary)] sm:w-[11.5rem]">
            {item.label}
          </span>
          <div className="min-w-[8.5rem] flex-1">
            <div className="h-3 overflow-hidden rounded-full bg-[var(--bg-surface-alt)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#1fa971_0%,#28c7b7_100%)]"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
          <span className="w-12 shrink-0 text-right text-sm font-semibold text-[var(--text-primary)] sm:w-14">
            {item.value}
            {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}
