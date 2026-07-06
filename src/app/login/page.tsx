import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ error, message, redirectTo }, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);

  if (user) {
    redirect("/app");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-10 sm:px-8 lg:px-10">
      <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="surface-panel order-2 flex flex-col justify-between gap-8 px-6 py-8 sm:px-10 lg:order-1">
          <div className="space-y-5">
            <Badge tone="accent">Supabase auth</Badge>
            <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.04em]">
              Sign in to enter the real protected workspace shell.
            </h1>
            <p className="max-w-xl text-base leading-8 text-[var(--text-secondary)]">
              The frontend now uses real Supabase auth actions, route protection, and
              server-side session checks while the broader Phase 3 data model comes online.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="surface-card p-4">
              <p className="text-sm font-semibold">Session planning</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Protected routes now check for a real authenticated user before rendering.
              </p>
            </div>
            <div className="surface-card p-4">
              <p className="text-sm font-semibold">Env safe</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                No privileged keys are exposed in the client bundle.
              </p>
            </div>
            <div className="surface-card p-4">
              <p className="text-sm font-semibold">Deploy ready</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                The auth flow still compiles safely even before real env values are added.
              </p>
            </div>
          </div>
        </section>

        <Card className="order-1 p-6 sm:p-8 lg:order-2">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary-hover)]">
                Welcome back
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                Continue into your agency workspace
              </h2>
            </div>
            <form action={loginAction} className="space-y-4">
              <input name="redirectTo" type="hidden" value={redirectTo ?? "/app"} />
              <Input
                autoComplete="email"
                label="Work email"
                name="email"
                placeholder="hello@agencyflow.ai"
                required
                type="email"
              />
              <Input
                autoComplete="current-password"
                label="Password"
                name="password"
                placeholder="Enter your password"
                required
                type="password"
              />
              {error ? (
                <p className="rounded-[18px] border border-[rgba(239,107,107,0.28)] bg-[rgba(239,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
                  {error}
                </p>
              ) : null}
              {message ? (
                <p className="rounded-[18px] border border-[rgba(31,169,113,0.18)] bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--accent-primary-hover)]">
                  {message}
                </p>
              ) : null}
              <Button className="w-full" type="submit">
                Sign in to AgencyFlow AI
              </Button>
            </form>
            <p className="text-sm text-[var(--text-secondary)]">
              Need an account?{" "}
              <Link href="/signup" className="font-semibold text-[var(--accent-primary-hover)]">
                Create one here
              </Link>
              .
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
