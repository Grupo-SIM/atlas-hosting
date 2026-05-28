import { getAllUsersWithBalanceAction } from "./actions";
import { UsersTable } from "./UsersTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { toBrl } from "@/lib/utils";
import { Metadata } from "next";
import { Users, ShieldCheck, CheckCircle, XCircle, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Usuários — Admin" };

export default async function AdminUsersPage() {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  const users = await getAllUsersWithBalanceAction();

  const active       = users.filter((u) => u.suspendedAt === null).length;
  const suspended    = users.filter((u) => u.suspendedAt !== null).length;
  const totalEarned  = users.reduce((acc, u) => acc + u.totalEarnedBrl, 0);
  const totalBalance = users.reduce((acc, u) => acc + u.balanceCents / 100, 0);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-4 md:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie contas de usuários da plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-primary">
            Acesso Restrito: Admin
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspensos</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{suspended}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total dos afiliados</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{toBrl(totalBalance)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
