import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import clsx from "clsx";
import { Check } from "lucide-react";
import { PlanModal } from "../admin/components/PlanModal";
import { getFeatures } from "../admin/page";

export default async function PlansPage() {
  const features = await getFeatures();

  const plans = await db.query.plansTable.findMany({
    with: {
      features: true,
    },
  });

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hosting Plans</h1>
        <p className="text-muted-foreground">
          Choose the perfect hosting plan for your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={clsx([plan.featured ? "border-primary shadow-lg" : "", "flex flex-col"])}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
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
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                <div className=" h-full flex-1">
                  <div>
                    <p className="text-sm font-medium mb-3">What&apos;s included:</p>
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
                Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Need a custom plan?</CardTitle>
          <CardDescription>
            Contact our sales team for a tailored solution that meets your specific requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline">Schedule a Call</Button>
            <Button variant="outline">Email Sales</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Planos</CardTitle>
          <CardDescription>Visualize e edite os planos disponíveis para os usuários.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 justify-end mb-4">
            <PlanModal features={features} />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Recursos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell>{plan.description}</TableCell>
                    <TableCell>R$ {plan.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {plan.features.map((feature) => (
                          <Badge key={feature.id} variant="secondary" className="text-xs">
                            {feature.description}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Add edit/delete buttons here if needed */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}