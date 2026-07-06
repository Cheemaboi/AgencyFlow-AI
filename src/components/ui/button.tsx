import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  size?: "md" | "lg";
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "ghost";
};

function getStyles(
  variant: NonNullable<ButtonProps["variant"]>,
  size: NonNullable<ButtonProps["size"]>,
) {
  const base =
    "inline-flex items-center justify-center rounded-full font-semibold transition-colors";
  const sizes = {
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-sm",
  };
  const variants = {
    primary: "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)]",
    secondary:
      "border border-[var(--border-subtle)] bg-white text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]",
    ghost: "text-[var(--text-primary)] hover:bg-white/70",
  };

  return `${base} ${sizes[size]} ${variants[variant]}`;
}

export function Button({
  children,
  className = "",
  disabled = false,
  href,
  size = "md",
  type = "button",
  variant = "primary",
}: ButtonProps) {
  const styles = `${getStyles(variant, size)} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={styles} disabled={disabled} type={type}>
      {children}
    </button>
  );
}
