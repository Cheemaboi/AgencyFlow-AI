import { updatePasswordAction } from "@/app/auth/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-5 py-10 sm:px-8 lg:px-10">
      <Card className="w-full p-6 sm:p-8">
        <Badge tone="accent">Set a new password</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
          Update your account password
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
          This page only works after opening a valid recovery link from your email.
        </p>

        <form action={updatePasswordAction} className="mt-6 space-y-4">
          <PasswordInput
            autoComplete="new-password"
            label="New password"
            name="password"
            placeholder="Create a new password"
            required
          />
          <PasswordInput
            autoComplete="new-password"
            label="Confirm password"
            name="confirmPassword"
            placeholder="Repeat your new password"
            required
          />
          {error ? (
            <p className="rounded-[18px] border border-[rgba(239,107,107,0.28)] bg-[rgba(239,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </p>
          ) : null}
          <Button className="w-full" type="submit">
            Save new password
          </Button>
        </form>
      </Card>
    </main>
  );
}
