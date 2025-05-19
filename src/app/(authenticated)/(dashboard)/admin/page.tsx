import { db } from "@/lib/db";
import { featureTable } from "@/lib/db/schema";
import { cache } from "react";
import { DomainStats } from "./components/DomainStats";
import { InvoiceStats } from "./components/InvoiceStats";
import PlansSection from "./components/PlansSection";
import { PlanStats } from "./components/PlanStats";
import { UserStats } from "./components/UserStats";

export const getFeatures = cache(async () => await db.select().from(featureTable));

export default async function AdminPage() {
  return (
    <div className="space-y-10 p-2 md:p-6">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">Administrador</h1>
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

      {/* Planos Section for Admins */}
      <section className="space-y-6">
        <PlansSection />
      </section>
    </div>
  );
} 