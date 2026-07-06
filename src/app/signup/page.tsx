import Link from "next/link";
import { redirect } from "next/navigation";
import { signupAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
          <form action={signupAction} className="mt-6 space-y-4">
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
            <Input
              autoComplete="new-password"
              label="Password"
              name="password"
              placeholder="Create a password"
              required
              type="password"
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
              "Your account is ready to bootstrap an organization profile and owner membership.",
              "Supabase client and server utilities now support real auth actions and protected routes.",
              "The visual system and app shell stay intact while Phase 3 data and role wiring lands underneath.",
            ].map((item) => (
              <div key={item} className="surface-card p-4">
                <p className="text-sm leading-7 text-[var(--text-secondary)]">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
