import Link from "next/link";
import { redirect } from "next/navigation";
import { requestPasswordResetAction } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const [{ error, message }, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);

  if (user) {
    redirect("/app");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-5 py-10 sm:px-8 lg:px-10">
      <Card className="w-full p-6 sm:p-8">
        <Badge tone="accent">Password recovery</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
          Send a fresh reset link
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
          Use the same email address you signed up with. We&apos;ll send a secure recovery
          link that returns you to AgencyFlow AI to set a new password.
        </p>

        <form action={requestPasswordResetAction} className="mt-6 space-y-4">
          <Input
            autoComplete="email"
            label="Account email"
            name="email"
            placeholder="hello@agencyflow.ai"
            required
            type="email"
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
            Email reset link
          </Button>
        </form>

        <p className="mt-5 text-sm text-[var(--text-secondary)]">
          Back to{" "}
          <Link href="/login" className="font-semibold text-[var(--accent-primary-hover)]">
            sign in
          </Link>
          .
        </p>
      </Card>
    </main>
  );
}
