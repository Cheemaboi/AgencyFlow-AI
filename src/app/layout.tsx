import type { Metadata } from "next";
import { cookies } from "next/headers";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { ThemeCookieSync } from "@/components/theme/theme-cookie-sync";
import { THEME_COOKIE_NAME, normalizeThemePreference } from "@/lib/theme";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AgencyFlow AI",
    template: "%s | AgencyFlow AI",
  },
  description:
    "Premium agency client portal foundation built for polished project delivery, approvals, and AI-assisted operations.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = normalizeThemePreference(cookieStore.get(THEME_COOKIE_NAME)?.value);

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${manrope.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeCookieSync />
        {children}
      </body>
    </html>
  );
}
