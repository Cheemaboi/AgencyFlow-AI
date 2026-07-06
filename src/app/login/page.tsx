import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-10 sm:px-8 lg:px-10">
      <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="surface-panel order-2 flex flex-col justify-between gap-8 px-6 py-8 sm:px-10 lg:order-1">
          <div className="space-y-5">
            <Badge tone="accent">Auth scaffold</Badge>
            <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.04em]">
              Sign in to review the app shell and prepare for Supabase-backed auth.
            </h1>
            <p className="max-w-xl text-base leading-8 text-[var(--text-secondary)]">
              This form is intentionally wired as a UI scaffold in Phase 1 so we can
              validate spacing, hierarchy, and protected-route planning before real auth
              lands.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="surface-card p-4">
              <p className="text-sm font-semibold">Session planning</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Route guard hooks and proxy scaffolding are ready for Phase 3.
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
                Baseline routes compile on a Vercel-friendly setup.
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
            <form className="space-y-4">
              <Input label="Work email" placeholder="hello@agencyflow.ai" type="email" />
              <Input label="Password" placeholder="Enter your password" type="password" />
              <Button href="/app" className="w-full">
                Open demo workspace
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
