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
import { AffiliateChart } from "./components/AffiliateChart";
import AffiliateLinkDisplay from "./components/AffiliateLinkDisplay";
import { DatePickerWithRange } from "./components/DateRangePicker";

export const metadata: Metadata = {
  title: "Afiliado - Atlas Hosting",
  description:
    "Gerencie suas indicações, comissões e solicite saques de forma fácil e rápida",
};

export default async function AffiliatePage() {
  const user = await getUser();

  const affiliateLink = `${process.env.PUBLIC_URL}/signup?ref=${user.id}`;

  const systemConfig = await db.query.pgSystemConfig.findFirst();

  if (!systemConfig) {
    throw new Error("Configuração de comissão de afiliados não encontrada");
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toBrl(allTimeValues)}</div>
            <div className="flex items-center mt-4 text-green-500">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span className="text-sm">+12.5% este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <Progress value={conversionRate} className="mt-4" />
            <p className="text-xs text-muted-foreground mt-2">
              Média do mercado: 25%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Disponível
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toBrl(availableBalance)}</div>
            <Button
              className="w-full mt-4"
              disabled={availableBalance < minimumWithdrawal}
            >
              Solicitar saque
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Mínimo para saque: {toBrl(minimumWithdrawal)}
            </p>
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

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho</CardTitle>
          <CardDescription>
            Análise de ganhos e indicações ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AffiliateChart />
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
          {referredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">
                Nenhum usuário indicado ainda
              </h3>
              <p className="text-muted-foreground">
                Compartilhe seu link de afiliado para começar a ganhar!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuários..."
                    // value={searchQuery}
                    // onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <DatePickerWithRange />
                <Select value="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Data de Registro</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <UserCircle className="mr-2 h-4 w-4" />
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.createdAt), "PPP", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>??</TableCell>
                        <TableCell>
                          {!user.deletedAt ? (
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-500"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-red-500/10 text-red-500"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
