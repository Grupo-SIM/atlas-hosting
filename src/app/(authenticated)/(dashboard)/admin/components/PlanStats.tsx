import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";

export async function PlanStats() {
  const planStats = await db.query.plansTable.findMany({
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
          {planStats.map((plan) => (
            <div key={plan.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{plan.name}</span>
                <span className="text-gray-600">
                  {plan.users.length} usuários
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {plan.users.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center py-1"
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
