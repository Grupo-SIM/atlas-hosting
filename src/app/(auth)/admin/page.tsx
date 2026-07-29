import { db } from "@/lib/db";
import { type Plan, pgPlan } from "@/lib/db/schema";
import { DomainStats } from "./components/DomainStats";
import { InvoiceStats } from "./components/InvoiceStats";
import { PlanStats } from "./components/PlanStats";
import PlansSection from "./components/PlansSection";
import { UserStats } from "./components/UserStats";

interface AdminPageProps {
  searchParams: Promise<{ page?: string; search?: string; clientId?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const resolvedSearchParams = await searchParams;

  // Fetch initial plans data on the server
  const initialPlans: Plan[] = await db
    .select()
    .from(pgPlan)
    .orderBy(pgPlan.id);

  return (
    <div className="space-y-10 p-2 md:p-6">
      <header className="mb-6">
        <h1 className="mb-1 font-bold text-3xl tracking-tight md:text-4xl">
          Administrador
        </h1>
        <p className="text-lg text-muted-foreground">
          Visão geral das estatísticas da plataforma de hospedagem
        </p>
      </header>

      <section className="space-y-6">
        <UserStats />
      </section>

      <section className="space-y-6">
        <PlanStats />
      </section>

      <section className="space-y-6">
        <InvoiceStats searchParams={resolvedSearchParams} />
      </section>

      <section className="space-y-6">
        <DomainStats />
      </section>

      <section className="space-y-6">
        <PlansSection initialPlans={initialPlans} />
      </section>
    </div>
  );
}
