import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const tiers = [
  {
    name: "Studio",
    price: "$39",
    description: "For solo operators and boutique shops validating the client portal model.",
  },
  {
    name: "Agency",
    price: "$129",
    description: "For growing teams that need shared workspaces, approvals, and operational clarity.",
  },
  {
    name: "Scale",
    price: "Custom",
    description: "For multi-team organizations that need advanced governance and tailored rollout support.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 pb-16 pt-6 sm:px-8 lg:px-10">
        <section className="surface-panel px-6 py-8 sm:px-10">
          <Badge tone="accent">Positioning only</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em]">
            A pricing surface is in place so marketing routes feel complete during
            foundation work.
          </h1>
        </section>
        <section className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <Card key={`${tier.name}-${tier.price}-${index}`} className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary-hover)]">
                {tier.name}
              </p>
              <p className="mt-5 text-4xl font-semibold tracking-[-0.04em]">{tier.price}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                {tier.description}
              </p>
              <Button href="/signup" variant="secondary" className="mt-8 w-full">
                Start with {tier.name}
              </Button>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
