type SidePanelProps = {
  title: string;
  description: string;
};

export function SidePanel({ title, description }: SidePanelProps) {
  return (
    <aside className="surface-panel p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="section-kicker">AI panel</p>
        <span className="pill pill-accent">Assist mode</span>
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
      <div className="mt-5 space-y-3">
        {[
          "Summaries stay tied to the current page context.",
          "Prompts can turn blockers into next-step actions.",
          "Approval and delivery gaps stay visible while you work.",
        ].map((item) => (
          <div key={item} className="inset-card px-4 py-3">
            <p className="text-sm leading-6 text-[var(--text-secondary)]">{item}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
