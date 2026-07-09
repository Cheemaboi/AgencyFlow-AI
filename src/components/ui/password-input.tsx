"use client";

import { useEffect, useId, useRef } from "react";

type PasswordInputProps = {
  autoComplete?: string;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
};

export function PasswordInput({
  autoComplete,
  label,
  name,
  placeholder,
  required,
}: PasswordInputProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const input = inputRef.current;

    if (!button || !input) {
      return;
    }

    const handleToggle = () => {
      const revealed = input.type === "password";
      input.type = revealed ? "text" : "password";
      button.setAttribute(
        "aria-label",
        revealed ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`,
      );
      button.setAttribute("aria-pressed", String(revealed));
      button.textContent = revealed ? "Hide" : "Show";
    };

    button.addEventListener("click", handleToggle);
    return () => {
      button.removeEventListener("click", handleToggle);
    };
  }, [label]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[var(--text-primary)]" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          autoComplete={autoComplete}
          className="h-12 w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 pr-20 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-primary)]"
          ref={inputRef}
          name={name}
          placeholder={placeholder}
          required={required}
          type="password"
        />
        <button
          aria-label={`Show ${label.toLowerCase()}`}
          aria-pressed="false"
          className="absolute inset-y-0 right-3 my-auto h-8 rounded-full px-3 text-xs font-semibold text-[var(--accent-primary-hover)] transition-colors hover:bg-[var(--accent-soft)]"
          ref={buttonRef}
          type="button"
        >
          Show
        </button>
      </div>
    </div>
  );
}
