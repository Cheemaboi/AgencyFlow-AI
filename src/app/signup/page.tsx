import Link from "next/link";
import { redirect } from "next/navigation";
import { signupAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const [{ error }, user] = await Promise.all([searchParams, getCurrentUser()]);

  if (user) {
    redirect("/app");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-10 sm:px-8 lg:px-10">
      <div className="grid w-full gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="p-6 sm:p-8">
          <Badge tone="accent">Workspace setup</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
            Create your agency owner account
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
            Set up the real owner identity that appears inside the app shell, then
            attach it to the agency workspace your clients will recognize.
          </p>
          <form action={signupAction} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                autoComplete="name"
                label="Full name"
                name="fullName"
                placeholder="Hamza Cheema"
                required
              />
              <Input
                autoComplete="organization-title"
                label="Role or title"
                name="roleTitle"
                placeholder="Founder"
              />
            </div>
            <Input
              autoComplete="organization"
              label="Agency name"
              name="agencyName"
              placeholder="Northshore Studio"
              required
            />
            <Input
              autoComplete="email"
              label="Owner email"
              name="email"
              placeholder="you@northshore.studio"
              required
              type="email"
            />
            <PasswordInput
              autoComplete="new-password"
              label="Password"
              name="password"
              placeholder="Create a password"
              required
            />
            <PasswordInput
              autoComplete="new-password"
              label="Confirm password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              required
            />
            {error ? (
              <p className="rounded-[18px] border border-[rgba(239,107,107,0.28)] bg-[rgba(239,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
                {error}
              </p>
            ) : null}
            <Button className="w-full" type="submit">
              Create workspace account
            </Button>
          </form>
          <p className="mt-5 text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--accent-primary-hover)]">
              Sign in instead
            </Link>
            .
          </p>
        </Card>
        <section className="surface-panel px-6 py-8 sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary-hover)]">
            What this unlocks
          </p>
          <div className="mt-6 grid gap-4">
            {[
              "Your owner profile now carries a real full name instead of recycling the company name.",
              "The agency identity you enter here becomes the organization record used across protected routes.",
              "Phase 3 now has the right shape for future profile icons, richer member details, and invite flows.",
            ].map((item, index) => (
              <div key={`${item}-${index}`} className="surface-card p-4">
                <p className="text-sm leading-7 text-[var(--text-secondary)]">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
