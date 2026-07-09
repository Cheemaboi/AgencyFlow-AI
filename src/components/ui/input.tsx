import type { ComponentPropsWithoutRef } from "react";

type InputProps = ComponentPropsWithoutRef<"input"> & {
  ariaLabel?: string;
  label?: string;
};

export function Input({
  ariaLabel,
  autoComplete,
  defaultValue,
  disabled,
  label,
  name,
  placeholder,
  readOnly,
  required,
  type = "text",
  value,
}: InputProps) {
  const field = (
    <input
      aria-label={ariaLabel ?? label}
      autoComplete={autoComplete}
      className="h-12 w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-primary)] disabled:cursor-not-allowed disabled:opacity-70"
      defaultValue={defaultValue}
      disabled={disabled}
      name={name}
      placeholder={placeholder}
      readOnly={readOnly}
      required={required}
      type={type}
      value={value}
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
