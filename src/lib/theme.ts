export const themeOptions = ["light", "dark"] as const;

export type ThemePreference = (typeof themeOptions)[number];

export const THEME_COOKIE_NAME = "agencyflow-theme";

export function normalizeThemePreference(value: string | null | undefined): ThemePreference {
  return value === "dark" ? "dark" : "light";
}
