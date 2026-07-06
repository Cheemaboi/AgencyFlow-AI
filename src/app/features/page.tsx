import { PublicHeader } from "@/components/layout/public-header";
import { Card } from "@/components/ui/card";
import { productModules } from "@/lib/mock";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 pb-16 pt-6 sm:px-8 lg:px-10">
        <section className="surface-panel px-6 py-8 sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary-hover)]">
            Product modules
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em]">
            Every route in the Phase 1 scaffold maps back to the approved product
            architecture.
          </h1>
        </section>
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {productModules.map((module) => (
            <Card key={module.title} className="p-6">
              <p className="text-sm font-semibold text-[var(--accent-primary-hover)]">
                {module.route}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                {module.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                {module.description}
              </p>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
