import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";

export async function PlanStats() {
  const planStats = await db.query.pgPlan.findMany({
    with: {
      users: true,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Planos</CardTitle>
        <CardDescription>
          Número de usuários por plano de hospedagem
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {planStats.map(plan => (
            <div className="space-y-2" key={plan.id}>
              <div className="flex items-center justify-between">
                <span className="font-medium">{plan.name}</span>
                <span className="text-gray-600">
                  {plan.users.length} usuários
                </span>
              </div>
              <div className="text-muted-foreground text-sm">
                {plan.users.map((user: any) => (
                  <div
                    className="flex items-center justify-between py-1"
                    key={user.id}
                  >
                    <span>{user.name}</span>
                    <span className="text-xs">{user.email}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
