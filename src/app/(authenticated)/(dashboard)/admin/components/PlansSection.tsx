import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { Plan, plansTable } from "@/lib/db/schema";
import Link from "next/link";
import { getFeatures } from "../page";
import { FeatureModal } from "./FeatureModal";
import { PlanModal } from "./PlanModal";

export default async function PlansSection() {
  const plans: Plan[] = await db.select().from(plansTable);
  const features = await getFeatures();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between w-full">
            <h2 className="text-xl font-semibold mb-2">Planos</h2>
            <div className="flex gap-2 justify-end mb-4">
              <PlanModal features={features} />
              <FeatureModal />
            </div>
          </div>
        </CardTitle>
        <CardDescription>
          Visualize e edite os planos disponíveis para os usuários.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.name}</TableCell>
                  <TableCell>{plan.description}</TableCell>
                  <TableCell>R$ {plan.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/plans/${plan.id}/edit`}>Editar</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
