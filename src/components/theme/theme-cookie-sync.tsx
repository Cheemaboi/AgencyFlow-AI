"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { THEME_COOKIE_NAME, normalizeThemePreference } from "@/lib/theme";

function readThemeCookie() {
  const cookieValue = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${THEME_COOKIE_NAME}=`))
    ?.split("=")[1];

  return normalizeThemePreference(cookieValue ? decodeURIComponent(cookieValue) : null);
}

export function ThemeCookieSync() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const applyTheme = () => {
      document.documentElement.setAttribute("data-theme", readThemeCookie());
    };

    applyTheme();

    const syncDelays = [120, 500, 1200];
    const timers = syncDelays.map((delay) => window.setTimeout(applyTheme, delay));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [pathname, searchParams]);

  return null;
}
