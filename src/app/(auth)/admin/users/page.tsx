import {
  CheckCircle,
  Server,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { toBrl } from "@/lib/utils";
import { getAllUsersWithBalanceAction } from "./actions";
import { UsersTable } from "./UsersTable";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Usuários — Admin" };

export default async function AdminUsersPage() {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");

  const users = await getAllUsersWithBalanceAction();

  const active = users.filter(u => u.suspendedAt === null).length;
  const suspended = users.filter(u => u.suspendedAt !== null).length;
  const subscribers = users.filter(u => u.hasActiveSubscription).length;
  const totalEarned = users.reduce((acc, u) => acc + u.totalEarnedBrl, 0);
  const totalBalance = users.reduce((acc, u) => acc + u.balanceCents / 100, 0);

  return (
    <div className="flex-1 space-y-6 p-4 pt-4 md:p-8 md:pt-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-bold text-3xl tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie contas de usuários da plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-bold text-primary text-sm">
            Acesso Restrito: Admin
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">{active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Suspensos</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-red-600">{suspended}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Clientes (com assinatura)
            </CardTitle>
            <Server className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-sky-600">{subscribers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Saldo Total dos afiliados
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-blue-600">
              {toBrl(totalBalance)}
            </div>
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
