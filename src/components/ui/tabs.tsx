type TabsProps = {
  items: string[];
};

export function Tabs({ items }: TabsProps) {
  return (
    <div className="surface-card p-3 sm:p-4">
      <div className="flex min-w-0 flex-wrap gap-2">
        {items.map((item, index) => (
          <button
            key={`${item}-${index}`}
            type="button"
            className={`h-11 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors ${
              index === 0
                ? "border-[rgba(31,169,113,0.16)] bg-[var(--accent-soft)] text-[var(--accent-primary-hover)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
