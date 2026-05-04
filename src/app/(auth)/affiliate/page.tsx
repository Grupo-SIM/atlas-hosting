import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  pgInvoice,
  pgOrganization,
  pgUser,
  pgWithdrawalRequests,
} from "@/lib/db/schema";
import { toBrl } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { and, eq, sum } from "drizzle-orm";
import {
  ArrowUpRight,
  CheckCircle,
  DollarSign,
  Search,
  TrendingUp,
  UserCircle,
  Users,
  XCircle,
} from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import AffiliateLinkDisplay from "./components/AffiliateLinkDisplay";
import { ReferredUsersTable } from "./components/ReferredUsersTable";

export const metadata: Metadata = {
  title: "Afiliado - Atlas Hosting",
  description:
    "Gerencie suas indicações, comissões e solicite saques de forma fácil e rápida",
};

export default async function AffiliatePage() {
  const user = await getUser();

  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://atlashosting.com.br";
  const affiliateLink = `${baseUrl}/signup?ref=${user.affiliateCode}`;

  let systemConfig = await db.query.pgSystemConfig.findFirst();

  if (!systemConfig) {
    systemConfig = {
      domainFee: 5.0,
      referrerCommission: 10.0,
      minWithdrawalAmount: 50.0,
    };
  }

  const allTimeValues = await db
    .select({ value: sum(pgInvoice.amount) })
    .from(pgInvoice)
    .leftJoin(pgUser, eq(pgInvoice.userId, pgUser.id))
    .where(eq(pgUser.referrerId, user.id))
    .then(
      (result) =>
        +(result[0].value ?? 0) * (systemConfig.referrerCommission / 100)
    );

  const referredUsers = await db.query.pgUser.findMany({
    where: eq(pgUser.referrerId, user.id),
    columns: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      deletedAt: true,
    },
  });

  const totalWithdrawn = await db
    .select({ value: sum(pgWithdrawalRequests.amount) })
    .from(pgWithdrawalRequests)
    .where(
      and(
        eq(pgWithdrawalRequests.userId, user.id),
        eq(pgWithdrawalRequests.status, "approved")
      )
    )
    .then((result) => +(result[0].value ?? 0));

  const availableBalance = allTimeValues - totalWithdrawn;
  const minimumWithdrawal = systemConfig.minWithdrawalAmount;
  const totalReferrals = referredUsers.length;

  const conversionRate = 10;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Programa de Afiliados
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas indicações e comissões
          </p>
        </div>
      </div>

      {/* Referral Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Indicações
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrals}</div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Card */}
      <Card>
        <CardHeader>
          <CardTitle>Seu Link de Afiliado</CardTitle>
          <CardDescription>
            Compartilhe este link para ganhar comissões em todas as vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AffiliateLinkDisplay affiliateLink={affiliateLink} />
        </CardContent>
      </Card>

      {/* Referred Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Indicados</CardTitle>
          <CardDescription>
            Lista de todos os usuários que se registraram através do seu link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReferredUsersTable users={referredUsers} />
        </CardContent>
      </Card>

    </div>
  );
}
