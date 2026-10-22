import { eq, sql } from "drizzle-orm";
import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { pgInvoice, pgUser } from "@/lib/db/schema";
import { InvoiceChart } from "./InvoiceChart";
import { InvoiceClientFilter } from "./InvoiceClientFilter";
import { InvoiceList } from "./InvoiceList";

interface InvoiceStatsProps {
  searchParams?: { page?: string; search?: string; clientId?: string };
}

export async function InvoiceStats({ searchParams }: InvoiceStatsProps) {
  const [statusStats, typeStats, averageAmount, totalInvoices, clients] =
    await Promise.all([
      db
        .select({
          count: sql<number>`count(*)`,
          status: pgInvoice.status,
          total: sql<number>`sum(amount)`,
        })
        .from(pgInvoice)
        .groupBy(pgInvoice.status),
      db
        .select({
          count: sql<number>`count(*)`,
          type: pgInvoice.type,
        })
        .from(pgInvoice)
        .groupBy(pgInvoice.type),
      db
        .select({
          avg: sql<number>`avg(amount)`,
        })
        .from(pgInvoice),
      db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(pgInvoice),
      // Só clientes que já têm ao menos uma fatura — é o universo relevante pro dropdown de filtro.
      db
        .selectDistinct({
          email: pgUser.email,
          id: pgUser.id,
          name: pgUser.name,
        })
        .from(pgInvoice)
        .innerJoin(pgUser, eq(pgInvoice.userId, pgUser.id))
        .orderBy(pgUser.name),
    ]);

  const selectedClient = searchParams?.clientId
    ? (clients.find(c => c.id === searchParams.clientId) ?? null)
    : null;

  const totalCount = totalInvoices[0].count;
  const totalAmount = statusStats.reduce(
    (acc, stat) => acc + (stat.total || 0),
    0
  );
  const avgAmount = averageAmount[0].avg || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas de Faturas</CardTitle>
        <CardDescription>
          Visão geral dos status e valores das faturas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-medium text-sm">
                  Total de Faturas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{totalCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-medium text-sm">
                  Valor Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  R$ {avgAmount.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-medium text-sm">
                  Total Arrecadado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  R$ {totalAmount.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-medium text-sm">
                  Taxa de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  {(
                    ((statusStats.find(s => s.status === "paid")?.count || 0) /
                      totalCount) *
                    100
                  ).toFixed(1)}
                  %
                </div>
              </CardContent>
            </Card>
          </div>

          <InvoiceChart statusStats={statusStats} typeStats={typeStats} />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8" placeholder="Buscar faturas..." />
              </div>
              <InvoiceClientFilter clients={clients} />
            </div>
            <InvoiceList
              searchParams={searchParams}
              selectedClient={selectedClient}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
