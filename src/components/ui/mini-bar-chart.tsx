type MiniBarChartProps = {
  items: Array<{ label: string; value: number }>;
  suffix?: string;
};

export function MiniBarChart({ items, suffix = "" }: MiniBarChartProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={`${item.label}-${item.value}-${index}`}
          className="grid gap-2 sm:grid-cols-[minmax(0,10.5rem)_minmax(0,1fr)_3.5rem] sm:items-center sm:gap-4"
        >
          <span className="min-w-0 text-sm font-semibold leading-5 text-[var(--text-secondary)] sm:pr-2">
            {item.label}
          </span>
          <div className="flex min-w-0 items-center gap-3 sm:contents">
            <div className="min-w-0 flex-1">
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
        </div>
      ))}
    </div>
  );
}
