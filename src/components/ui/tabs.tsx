type TabsProps = {
  items: string[];
};

export function Tabs({ items }: TabsProps) {
  return (
    <div className="surface-card p-3">
      <div className="scroll-row flex min-w-0 gap-2">
        {items.map((item, index) => (
          <button
            key={item}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold ${
              index === 0
                ? "border-[rgba(31,169,113,0.16)] bg-[var(--accent-soft)] text-[var(--accent-primary-hover)]"
                : "border-transparent bg-transparent text-[var(--text-secondary)]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
