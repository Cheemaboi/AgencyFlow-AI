import { generateBillingInsightsAction } from "@/app/app/ai/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { MiniBarChart } from "@/components/ui/mini-bar-chart";
import { SubmitButton } from "@/components/ui/submit-button";
import { getBillingData } from "@/lib/data/billing";

type BillingPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const [{ error, message }, data] = await Promise.all([searchParams, getBillingData()]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing & analytics"
        title="Revenue, invoices, and utilization now read like a finance-aware product surface"
        description={
          data.usingFallback
            ? "This billing area is still showing fallback finance content until enough live invoice data is available."
            : "This billing area now reflects live invoice volume, current balances, and AI-ready finance commentary."
        }
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.revenueCards.map((metric, index) => (
          <Card key={`${metric.label}-${index}`} className="p-6">
            <p className="text-sm text-[var(--text-secondary)]">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{metric.value}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{metric.helper}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Revenue trend</h2>
          <div className="mt-5">
            <MiniBarChart items={data.revenueTrend.map((item) => ({ label: item.month, value: item.value }))} suffix="k" />
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Upcoming payments</h2>
          <div className="mt-5 space-y-3">
            {data.upcomingPayments.map((payment, index) => (
              <div key={`${payment.client}-${payment.date}-${index}`} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{payment.client}</p>
                  <span className="pill pill-accent">{payment.amount}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Due {payment.date}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Invoices and transactions</h2>
          <div className="mt-5">
            <DataTable columns={["Client", "Status", "Amount", "Date"]} rows={data.invoiceTable} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-[-0.03em]">AI billing insights</h2>
            <form action={generateBillingInsightsAction}>
              <SubmitButton pendingLabel="Refreshing insights..." variant="secondary">
                Refresh insights
              </SubmitButton>
            </form>
          </div>
          <div className="mt-5 space-y-3">
            {data.latestAiInsights.map((item, index) => (
              <div key={`billing-insight-${index}`} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                <p className="text-sm leading-7 text-[var(--text-secondary)]">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
