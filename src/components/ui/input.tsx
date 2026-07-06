type InputProps = {
  ariaLabel?: string;
  label?: string;
  placeholder?: string;
  type?: string;
};

export function Input({
  ariaLabel,
  label,
  placeholder,
  type = "text",
}: InputProps) {
  const field = (
    <input
      aria-label={ariaLabel ?? label}
      className="h-12 w-full rounded-[18px] border border-[var(--border-subtle)] bg-white px-4 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-primary)]"
      placeholder={placeholder}
      type={type}
    />
  );

  if (!label) {
    return field;
  }

  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
      {field}
    </label>
  );
}
