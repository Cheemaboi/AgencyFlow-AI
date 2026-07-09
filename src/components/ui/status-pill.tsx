type StatusPillProps = {
  children: React.ReactNode;
  status: string;
};

function getStatusClasses(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized.includes("pending")) {
    return "border-[rgba(245,185,66,0.34)] bg-[rgba(245,185,66,0.16)] text-[#9a6500]";
  }

  if (normalized.includes("review")) {
    return "border-[rgba(61,130,246,0.2)] bg-[rgba(61,130,246,0.12)] text-[#275ea8]";
  }

  if (normalized.includes("approved") || normalized.includes("healthy") || normalized.includes("active")) {
    return "border-[rgba(31,169,113,0.2)] bg-[var(--accent-soft)] text-[var(--accent-primary-hover)]";
  }

  if (normalized.includes("change") || normalized.includes("overdue")) {
    return "border-[rgba(239,107,107,0.28)] bg-[rgba(239,107,107,0.12)] text-[var(--danger)]";
  }

  if (normalized.includes("backlog") || normalized.includes("planning") || normalized.includes("empty")) {
    return "border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] text-[var(--text-secondary)]";
  }

  return "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)]";
}

export function StatusPill({ children, status }: StatusPillProps) {
  return (
    <span
      className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold leading-none ${getStatusClasses(
        status,
      )}`}
    >
      {children}
    </span>
  );
}
