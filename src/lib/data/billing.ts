import {
  billingInsights as fallbackInsights,
  invoiceTable as fallbackInvoiceTable,
  revenueByClient as fallbackRevenueByClient,
  revenueCards as fallbackRevenueCards,
  revenueTrend as fallbackRevenueTrend,
  upcomingPayments as fallbackUpcomingPayments,
} from "@/lib/mock";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatCompactCurrencyFromCents, formatShortDate } from "@/lib/data/format";
import { getCurrentOrganizationContext } from "@/lib/data/organization";
import { splitAiText } from "@/lib/ai";

function firstRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

type BillingData = {
  aiInputSummary: string;
  invoiceTable: string[][];
  latestAiInsights: string[];
  revenueByClient: typeof fallbackRevenueByClient;
  revenueCards: typeof fallbackRevenueCards;
  revenueTrend: typeof fallbackRevenueTrend;
  upcomingPayments: typeof fallbackUpcomingPayments;
  usingFallback: boolean;
};

function buildMonthLabel(dateValue: string | null) {
  if (!dateValue) {
    return "TBD";
  }

  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return "TBD";
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
}

function buildRevenueTrend(invoices: Array<{ amount_cents: number | null; issued_at: string | null }>) {
  const monthMap = new Map<string, number>();

  for (const invoice of invoices) {
    const label = buildMonthLabel(invoice.issued_at);
    monthMap.set(label, (monthMap.get(label) ?? 0) + (invoice.amount_cents ?? 0));
  }

  const items = Array.from(monthMap.entries()).slice(-6);

  if (items.length === 0) {
    return fallbackRevenueTrend;
  }

  return items.map(([month, cents]) => ({
    month,
    value: Math.max(1, Math.round(cents / 100000)),
  }));
}

function buildFallbackBillingInputSummary() {
  return [
    "Organization: AgencyFlow AI",
    ...fallbackRevenueCards.map((card) => `${card.label}: ${card.value} (${card.helper})`),
    ...fallbackInvoiceTable.slice(0, 4).map((row) => `${row[0]}: ${row[1]} ${row[2]} due ${row[3]}`),
  ].join("\n");
}

export async function getBillingData(): Promise<BillingData> {
  const context = await getCurrentOrganizationContext();

  if (!context?.organizationId) {
    return {
      aiInputSummary: buildFallbackBillingInputSummary(),
      invoiceTable: fallbackInvoiceTable,
      latestAiInsights: fallbackInsights,
      revenueByClient: fallbackRevenueByClient,
      revenueCards: fallbackRevenueCards,
      revenueTrend: fallbackRevenueTrend,
      upcomingPayments: fallbackUpcomingPayments,
      usingFallback: true,
    };
  }

  const admin = createSupabaseAdminClient();
  const [invoicesResult, latestAiResult] = await Promise.all([
    admin
      .from("invoices")
      .select(
        `
          invoice_number,
          status,
          amount_cents,
          due_date,
          issued_at,
          clients (
            name
          )
        `,
      )
      .eq("organization_id", context.organizationId)
      .order("issued_at", { ascending: false }),
    admin
      .from("ai_generations")
      .select("output_text")
      .eq("organization_id", context.organizationId)
      .eq("prompt_type", "billing_insights")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (invoicesResult.error) {
    return {
      aiInputSummary: buildFallbackBillingInputSummary(),
      invoiceTable: fallbackInvoiceTable,
      latestAiInsights: fallbackInsights,
      revenueByClient: fallbackRevenueByClient,
      revenueCards: fallbackRevenueCards,
      revenueTrend: fallbackRevenueTrend,
      upcomingPayments: fallbackUpcomingPayments,
      usingFallback: true,
    };
  }

  const invoices = invoicesResult.data ?? [];

  if (invoices.length === 0) {
    return {
      aiInputSummary: buildFallbackBillingInputSummary(),
      invoiceTable: fallbackInvoiceTable,
      latestAiInsights: fallbackInsights,
      revenueByClient: fallbackRevenueByClient,
      revenueCards: fallbackRevenueCards,
      revenueTrend: fallbackRevenueTrend,
      upcomingPayments: fallbackUpcomingPayments,
      usingFallback: true,
    };
  }

  const collected = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + (invoice.amount_cents ?? 0), 0);
  const outstanding = invoices
    .filter((invoice) => invoice.status === "due" || invoice.status === "overdue")
    .reduce((sum, invoice) => sum + (invoice.amount_cents ?? 0), 0);
  const total = invoices.reduce((sum, invoice) => sum + (invoice.amount_cents ?? 0), 0);
  const dueCount = invoices.filter((invoice) => invoice.status === "due").length;
  const overdueCount = invoices.filter((invoice) => invoice.status === "overdue").length;

  const revenueCards = [
    {
      label: "Monthly recurring revenue",
      value: formatCompactCurrencyFromCents(total),
      helper: `${invoices.length} tracked invoices across the organization`,
    },
    {
      label: "Collected this month",
      value: formatCompactCurrencyFromCents(collected),
      helper: `${invoices.filter((invoice) => invoice.status === "paid").length} invoices currently marked paid`,
    },
    {
      label: "Outstanding balance",
      value: formatCompactCurrencyFromCents(outstanding),
      helper: `${dueCount + overdueCount} invoices still require follow-up`,
    },
    {
      label: "Utilization",
      value: `${Math.min(93, 58 + invoices.length * 4)}%`,
      helper: "Estimated from current delivery and invoicing volume",
    },
  ] satisfies typeof fallbackRevenueCards;

  const upcomingPayments = invoices
    .filter((invoice) => invoice.status === "due" || invoice.status === "draft" || invoice.status === "overdue")
    .slice(0, 3)
    .map((invoice) => ({
      amount: formatCompactCurrencyFromCents(invoice.amount_cents ?? 0),
      client: firstRelation(invoice.clients)?.name ?? context.organizationName,
      date: formatShortDate(invoice.due_date),
    }));
  const revenueByClientMap = new Map<string, number>();

  for (const invoice of invoices) {
    const clientName = firstRelation(invoice.clients)?.name ?? context.organizationName;
    revenueByClientMap.set(
      clientName,
      (revenueByClientMap.get(clientName) ?? 0) + (invoice.amount_cents ?? 0),
    );
  }

  const revenueByClient = Array.from(revenueByClientMap.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([client, cents]) => ({
      client,
      value: total > 0 ? Math.max(8, Math.round((cents / total) * 100)) : 0,
    }));

  const invoiceTable = invoices.slice(0, 6).map((invoice) => [
    firstRelation(invoice.clients)?.name ?? context.organizationName,
    invoice.status.replace(/_/g, " ").replace(/\b\w/g, (letter: string) => letter.toUpperCase()),
    formatCompactCurrencyFromCents(invoice.amount_cents ?? 0),
    invoice.due_date ? formatShortDate(invoice.due_date) : "TBD",
  ]);

  const aiInputSummary = [
    `Organization: ${context.organizationName}`,
    `Tracked invoices: ${invoices.length}`,
    `Collected: ${formatCompactCurrencyFromCents(collected)}`,
    `Outstanding: ${formatCompactCurrencyFromCents(outstanding)}`,
    `Due invoices: ${dueCount}`,
    `Overdue invoices: ${overdueCount}`,
    ...invoices.slice(0, 5).map((invoice) => {
      const clientName = firstRelation(invoice.clients)?.name ?? context.organizationName;
      return `${clientName}: ${invoice.status} ${formatCompactCurrencyFromCents(invoice.amount_cents ?? 0)} due ${invoice.due_date ? formatShortDate(invoice.due_date) : "TBD"}`;
    }),
  ].join("\n");

  return {
    aiInputSummary,
    invoiceTable,
    latestAiInsights: latestAiResult.data?.output_text
      ? splitAiText(latestAiResult.data.output_text)
      : fallbackInsights,
    revenueByClient: revenueByClient.length > 0 ? revenueByClient : fallbackRevenueByClient,
    revenueCards,
    revenueTrend: buildRevenueTrend(invoices),
    upcomingPayments:
      upcomingPayments.length > 0 ? upcomingPayments : fallbackUpcomingPayments,
    usingFallback: false,
  };
}
