import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { MiniBarChart } from "@/components/ui/mini-bar-chart";
import { revenueCards, revenueTrend, upcomingPayments, invoiceTable, billingInsights } from "@/lib/mock";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing & analytics"
        title="Revenue, invoices, and utilization now read like a finance-aware product surface"
        description="The billing area now includes strong KPI framing, trends, client revenue mix, invoice status visibility, and AI financial commentary."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {revenueCards.map((metric) => (
          <Card key={metric.label} className="p-6">
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
            <MiniBarChart items={revenueTrend.map((item) => ({ label: item.month, value: item.value }))} suffix="k" />
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Upcoming payments</h2>
          <div className="mt-5 space-y-3">
            {upcomingPayments.map((payment) => (
              <div key={payment.client} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
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
            <DataTable columns={["Client", "Status", "Amount", "Date"]} rows={invoiceTable} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">AI billing insights</h2>
          <div className="mt-5 space-y-3">
            {billingInsights.map((item) => (
              <div key={item} className="rounded-[18px] border border-[var(--border-subtle)] p-4">
                <p className="text-sm leading-7 text-[var(--text-secondary)]">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
