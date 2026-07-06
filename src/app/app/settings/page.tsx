import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { appearanceOptions, settingsSections } from "@/lib/mock";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Account, appearance, branding, and security controls now feel product-ready"
        description="This settings view is structured for real growth, with clear sections for profile, organization, integrations, notifications, and theme management."
      />

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
          <p className="section-kicker">Configuration map</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Settings sections</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {settingsSections.map((section) => (
              <div key={section.title} className="inset-card p-4">
                <p className="font-semibold">{section.title}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                  {section.description}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="section-kicker">Theme direction</p>
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Appearance controls</h2>
          <div className="mt-5 space-y-3">
            {appearanceOptions.map((option) => (
              <div
                key={option.name}
                className={`p-4 ${
                  option.active
                    ? "highlight-card"
                    : "inset-card"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{option.name}</p>
                  <span className="pill pill-muted">{option.active ? "Active" : "Planned"}</span>
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{option.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
