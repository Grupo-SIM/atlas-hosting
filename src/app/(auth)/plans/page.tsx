import { db } from "@/lib/db";
import { PlanCard } from "./components/PlanCard";
import { getUser } from "@/lib/auth";
import { sortBy } from "lodash";
import { cookies } from "next/headers";

export default async function PlansPage() {
  const user = await getUser();

  // Fetch plans without the planFeatures relation
  const dbPlans = await db.query.pgPlan.findMany();

  // Plans now have feature columns directly.
  // The previous mapping to create a 'features' array is no longer needed.
  const plans = sortBy(dbPlans, [
    (plan) => (plan.id === user.planId ? -1 : 0),
    "price",
  ]);

  return (
    <div className="space-y-6 p-6 pb-16 max-w-500 mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Planos de hospedagem
        </h1>
        <p className="text-muted-foreground">
          Escolha o melhor plano para suas necessidades
        </p>
      </div>

      <div className="grid grid-flow-col gap-6 min-h-150">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} user={user} />
        ))}
      </div>
    </div>
  );
}
