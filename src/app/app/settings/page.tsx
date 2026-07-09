import { updateAppearanceSettingsAction, updateOrganizationSettingsAction, updateProfileSettingsAction } from "@/app/app/settings/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { getSettingsData } from "@/lib/data/settings";
import { settingsSections } from "@/lib/mock";
import { themeOptions } from "@/lib/theme";

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const [settings, { error, message }] = await Promise.all([getSettingsData(), searchParams]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Account, appearance, branding, and security controls now feel product-ready"
        description="Profile identity, organization presentation, and theme preference now persist through the real Supabase-backed account layer."
      />

      {message ? (
        <p className="rounded-[18px] border border-[rgba(31,169,113,0.18)] bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--accent-primary-hover)]">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-[18px] border border-[rgba(239,107,107,0.28)] bg-[rgba(239,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <Tabs
        items={[
          "Profile",
          "Organization",
          "Notifications",
          "Branding",
          "Integrations",
          "Appearance",
          "Security",
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-6">
          <p className="section-kicker">Profile</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Owner identity</h2>
          <form action={updateProfileSettingsAction} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                defaultValue={settings?.profile.fullName ?? ""}
                label="Full name"
                name="fullName"
                placeholder="Agency owner"
                required
              />
              <Input
                defaultValue={settings?.profile.jobTitle ?? ""}
                label="Role or title"
                name="jobTitle"
                placeholder="Founder"
              />
            </div>
            <Input
              defaultValue={settings?.profile.email ?? ""}
              disabled
              label="Email"
              name="email"
              placeholder="owner@agency.com"
              type="email"
            />
            <label className="flex items-center gap-3 rounded-[18px] border border-[var(--border-subtle)] px-4 py-3 text-sm text-[var(--text-primary)]">
              <input
                defaultChecked={settings?.profile.emailNotifications ?? true}
                name="emailNotifications"
                type="checkbox"
              />
              Receive email notifications for approvals, reminders, and billing changes
            </label>
            <Button type="submit">Save profile settings</Button>
          </form>
        </Card>

        <Card className="p-6">
          <p className="section-kicker">Organization</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Workspace identity</h2>
          <form action={updateOrganizationSettingsAction} className="mt-5 space-y-4">
            <Input
              defaultValue={settings?.organization.name ?? ""}
              label="Agency name"
              name="organizationName"
              placeholder="Northshore Studio"
              required
            />
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                Brand tagline
              </span>
              <textarea
                className="min-h-28 w-full rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-primary)]"
                defaultValue={settings?.organization.brandTagline ?? ""}
                name="brandTagline"
                placeholder="Calm client operations for modern agencies."
              />
            </label>
            <Button type="submit" variant="secondary">
              Save organization settings
            </Button>
          </form>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <p className="section-kicker">Appearance</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Theme preference</h2>
          <form action={updateAppearanceSettingsAction} className="mt-5 space-y-3">
            {themeOptions.map((option, index) => {
              const checked = (settings?.profile.themePreference ?? "light") === option;

              return (
                <label
                  key={`${option}-${index}`}
                  className={`block rounded-[22px] border p-4 ${
                    checked ? "highlight-card" : "inset-card"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      defaultChecked={checked}
                      name="themePreference"
                      type="radio"
                      value={option}
                    />
                    <div>
                      <p className="font-semibold capitalize">{option} mode</p>
                      <p className="mt-1 text-sm leading-7 text-[var(--text-secondary)]">
                        {option === "light"
                          ? "Keep the bright premium surface language across the workspace."
                          : "Use the darker token set for lower-glare reviews and after-hours work."}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })}
            <Button type="submit">Save appearance</Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <p className="section-kicker">Security</p>
            <h2 className="text-xl font-semibold tracking-[-0.03em]">Password and access</h2>
            <div className="mt-5 space-y-4">
              <div className="inset-card p-4">
                <p className="font-semibold">Password controls</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                  Use the password reset flow whenever you want to rotate credentials. Auth
                  screens now support show and hide controls for password fields.
                </p>
              </div>
              <Button href="/forgot-password" variant="secondary">
                Reset password
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <p className="section-kicker">Configuration map</p>
            <h2 className="text-xl font-semibold tracking-[-0.03em]">Settings sections</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {settingsSections.map((section, index) => (
              <div key={`${section.title}-${index}`} className="inset-card p-4">
                <p className="font-semibold">{section.title}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                  {section.description}
                </p>
              </div>
            ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
