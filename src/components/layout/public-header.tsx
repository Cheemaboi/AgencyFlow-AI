import Link from "next/link";
import { logoutAction } from "@/app/auth/actions";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { getCurrentOrganizationContext } from "@/lib/data/organization";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

function getInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "AF";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export async function PublicHeader() {
  const organization = await getCurrentOrganizationContext();
  const identityName = organization?.fullName ?? "Agency owner";
  const identityInitials = getInitials(identityName);

  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
      <Logo />
      <nav className="hidden items-center gap-7 md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            {link.label}
          </Link>
        ))}
        {organization ? (
          <Link
            href="/app"
            className="text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Open app
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Login
          </Link>
        )}
      </nav>
      {organization ? (
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 sm:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent-primary-hover)]">
              {identityInitials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {identityName}
              </p>
              <p className="truncate text-xs text-[var(--text-secondary)]">
                {organization.organizationName}
              </p>
            </div>
          </div>
          <form action={logoutAction}>
            <button className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-alt)]">
              Sign out
            </button>
          </form>
        </div>
      ) : (
        <Button href="/signup" variant="secondary">
          Start free
        </Button>
      )}
    </header>
  );
}
