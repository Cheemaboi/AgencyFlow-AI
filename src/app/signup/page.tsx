import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-10 sm:px-8 lg:px-10">
      <div className="grid w-full gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="p-6 sm:p-8">
          <Badge tone="accent">Workspace setup</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
            Create a new agency workspace shell
          </h1>
          <form className="mt-6 space-y-4">
            <Input label="Agency name" placeholder="Northshore Studio" />
            <Input label="Owner email" placeholder="you@northshore.studio" type="email" />
            <Input label="Password" placeholder="Create a password" type="password" />
            <Button href="/app" className="w-full">
              Launch demo app
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
              "App shell with overview, projects, files, billing, and settings route scaffolds.",
              "Supabase client and server utilities ready for real auth and persistence.",
              "A structured visual system with green accents, premium cards, and dark-mode token planning.",
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
