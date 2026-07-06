type BadgeProps = {
  children: React.ReactNode;
  tone?: "accent" | "muted";
};

export function Badge({ children, tone = "muted" }: BadgeProps) {
  return (
    <span className={`pill ${tone === "accent" ? "pill-accent" : "pill-muted"}`}>
      {children}
    </span>
  );
}
