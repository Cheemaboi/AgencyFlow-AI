import Link from "next/link";

type LogoProps = {
  className?: string;
  href?: string;
  variant?: "horizontal" | "stacked";
};

export function Logo({ className = "", href = "/", variant = "horizontal" }: LogoProps) {
  const mark = (
    <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#1fa971_0%,#28c7b7_100%)] shadow-[0_18px_32px_rgba(31,169,113,0.25)]">
      <span className="absolute h-6 w-6 rounded-full border-2 border-white/70" />
      <span className="absolute h-3 w-3 rounded-full bg-white" />
    </span>
  );

  const wordmark = (
    <span className="flex flex-col gap-1">
      <span className="text-lg font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
        AgencyFlow AI
      </span>
      <span className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--text-secondary)]">
        Client portal system
      </span>
    </span>
  );

  return (
    <Link
      href={href}
      className={`${className} inline-flex items-center ${
        variant === "stacked" ? "flex-col gap-3" : "gap-3"
      }`}
    >
      {mark}
      {wordmark}
    </Link>
  );
}
