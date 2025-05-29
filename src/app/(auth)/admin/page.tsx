import { DomainStats } from "./components/DomainStats.tsx";
import { InvoiceStats } from "./components/InvoiceStats.tsx";
import PlansSection from "./components/PlansSection.tsx";
import { PlanStats } from "./components/PlanStats.tsx";
import { UserStats } from "./components/UserStats.tsx";
import { db } from "@/lib/db";
import { pgPlan, type Plan } from "@/lib/db/schema";

export default async function AdminPage() {
  // Fetch initial plans data on the server
  const initialPlans: Plan[] = await db
    .select()
    .from(pgPlan)
    .orderBy(pgPlan.id);

  return (
    <div className="space-y-10 p-2 md:p-6">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">
          Administrador
        </h1>
        <p className="text-muted-foreground text-lg">
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
        <InvoiceStats />
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
