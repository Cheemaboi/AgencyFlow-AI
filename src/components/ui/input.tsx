import type { ComponentPropsWithoutRef } from "react";

type InputProps = ComponentPropsWithoutRef<"input"> & {
  ariaLabel?: string;
  label?: string;
};

export function Input({
  ariaLabel,
  autoComplete,
  defaultValue,
  label,
  name,
  placeholder,
  required,
  type = "text",
  value,
}: InputProps) {
  const field = (
    <input
      aria-label={ariaLabel ?? label}
      autoComplete={autoComplete}
      className="h-12 w-full rounded-[18px] border border-[var(--border-subtle)] bg-white px-4 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-primary)]"
      defaultValue={defaultValue}
      name={name}
      placeholder={placeholder}
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
