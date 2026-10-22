import { isNotNull, sql } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { pgOrganization, pgUser } from "@/lib/db/schema";
import { UserChart } from "./UserChart";

export async function UserStats() {
  const [totalUsers, activeUsers, newUsersThisMonth, userGrowth] =
    await Promise.all([
      db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(pgUser),
      db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(pgOrganization)
        .where(isNotNull(pgOrganization.planId)),
      db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(pgUser)
        .where(sql`${pgUser.createdAt} >= date_trunc('month', current_date)`),
      db
        .select({
          count: sql<number>`count(*)`,
          month: sql<string>`to_char(${pgUser.createdAt}, 'YYYY-MM')`,
        })
        .from(pgUser)
        .groupBy(sql`to_char(${pgUser.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`to_char(${pgUser.createdAt}, 'YYYY-MM')`)
        .limit(6),
    ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas de Usuários</CardTitle>
        <CardDescription>
          Visão geral do crescimento e atividade dos usuários
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-medium text-sm">
                  Total de Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{totalUsers[0].count}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-medium text-sm">
                  Usuários Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{activeUsers[0].count}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-medium text-sm">
                  Novos este Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  {newUsersThisMonth[0].count}
                </div>
              </CardContent>
            </Card>
          </div>

          <UserChart userGrowth={userGrowth} />
        </div>
      </CardContent>
    </Card>
  );
}
