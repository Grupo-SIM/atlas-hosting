import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import { isNotNull, sql } from "drizzle-orm";
import { UserChart } from "./UserChart";

export async function UserStats() {
  const [
    totalUsers,
    activeUsers,
    newUsersThisMonth,
    userGrowth
  ] = await Promise.all([
    db.select({
      count: sql<number>`count(*)`
    })
      .from(userTable),
    db.select({
      count: sql<number>`count(*)`
    })
      .from(userTable)
      .where(isNotNull(userTable.planId)),
    db.select({
      count: sql<number>`count(*)`
    })
      .from(userTable)
      .where(sql`${userTable.createdAt} >= date_trunc('month', current_date)`),
    db.select({
      month: sql<string>`to_char(${userTable.createdAt}, 'YYYY-MM')`,
      count: sql<number>`count(*)`
    })
      .from(userTable)
      .groupBy(sql`to_char(${userTable.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${userTable.createdAt}, 'YYYY-MM')`)
      .limit(6)
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalUsers[0].count}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeUsers[0].count}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Novos este Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
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