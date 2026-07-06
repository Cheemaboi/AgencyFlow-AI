import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getWorkspaceDirectoryData } from "@/lib/data/workspaces";

export default async function WorkspacesPage() {
  const data = await getWorkspaceDirectoryData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspaces"
        title="Client workspaces are now designed as full operational hubs"
        description={
          data.usingFallback
            ? "This directory is still showing designed fallback cards until real workspace records are available."
            : "This directory now reflects real organization workspaces from Supabase-backed data."
        }
      />
      <section className="grid gap-4 md:grid-cols-3">
        {data.stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{stat.value}</p>
          </Card>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-3">
        {data.workspaces.map((workspace) => (
          <Link key={workspace.id} href={`/app/workspaces/${workspace.id}`}>
            <Card className="h-full p-6 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{workspace.name}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {workspace.client}
                  </p>
                </div>
                <span className="pill pill-accent">{workspace.stage}</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                {workspace.summary}
              </p>
              <div className="mt-5 flex items-center justify-between text-sm text-[var(--text-secondary)]">
                <span>Overview, files, approvals</span>
                <span>Open workspace</span>
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
