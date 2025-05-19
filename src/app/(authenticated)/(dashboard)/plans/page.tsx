import { db } from "@/lib/db";
import { PlanCard } from "./components/PlanCard";
import { getUser } from "@/lib/auth";

export default async function PlansPage() {
  const user = (await getUser())!;

  const dbPlans = await db.query.plansTable.findMany({
    with: {
      planFeatures: {
        with: {
          feature: true,
        },
      },
    },
  });

  const plans = dbPlans.map((plan) => ({
    ...plan,
    features: plan.planFeatures.map(({ feature }) => feature),
  }));

  return (
    <div className="space-y-6 p-6 pb-16 max-w-500 mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Planos de hospedagem</h1>
        <p className="text-muted-foreground">
          Escolha o melhor plano para suas necessidades
        </p>
      </div>

      <div className="grid grid-flow-col gap-6 min-h-150">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} user={user} /> // Use the client component
        ))}
      </div>
    </div>
  );
}