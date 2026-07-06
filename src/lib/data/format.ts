export function formatCurrencyFromCents(value: number | null | undefined) {
  const amount = (value ?? 0) / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount >= 100 ? 0 : 1,
  }).format(amount);
}

export function formatCompactCurrencyFromCents(value: number | null | undefined) {
  const amount = (value ?? 0) / 100;

  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return "TBD";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parsed);
}

export function titleFromStage(value: string | null | undefined) {
  if (!value) {
    return "Planned";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
