import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { MiniBarChart } from "@/components/ui/mini-bar-chart";
import { revenueByClient, revenueTrend } from "@/lib/mock";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="A dedicated reporting view keeps performance storytelling clean"
        description="Separating analytics from billing gives the product room for performance trends, client mix, and operational health without crowding finance actions."
      />
      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Revenue growth</h2>
          <div className="mt-5">
            <MiniBarChart items={revenueTrend.map((item) => ({ label: item.month, value: item.value }))} suffix="k" />
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Client mix</h2>
          <div className="mt-5">
            <MiniBarChart items={revenueByClient.map((item) => ({ label: item.client, value: item.value }))} suffix="%" />
          </div>
        </Card>
      </section>
    </div>
  );
}
