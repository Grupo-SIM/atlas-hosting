import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import clsx from "clsx";
import { Check } from "lucide-react";
import { PlanModal } from "../admin/components/PlanModal";
import { getFeatures } from "../admin/page";
import { inArray } from "drizzle-orm"
import { planFeature } from "@/lib/db/schema";
import { capitalize } from "lodash";
import { toBrl } from "@/lib/utils";

export default async function PlansPage() {
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
          <Card key={plan.name} className={clsx([plan.featured ? "border-primary shadow-lg" : "", "flex flex-col h-full"])}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>{capitalize(plan.name)}</CardTitle>
                  <CardDescription>{capitalize(plan.description)}</CardDescription>
                </div>
                {plan.featured && (
                  <Badge variant="default" className="bg-primary text-primary-foreground">
                    Popular
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 h-full">
              <div className="flex flex-col h-full gap-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{toBrl(plan.price)}</span>
                  <span className="text-muted-foreground ml-1">/mês</span>
                </div>
                <div className=" h-full flex-1">
                  <div>
                    <p className="text-sm font-medium mb-3">Incluso:</p>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button className="w-full" variant={plan.featured ? "default" : "outline"}>
                  Adquirir Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}