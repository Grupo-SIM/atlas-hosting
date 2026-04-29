import { Card, CardContent } from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgInvoice } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { groupBy } from "lodash";
import { FileText } from "lucide-react";
import type { Metadata } from "next";
import InvoiceCard from "./_/invoice";
import Link from "next/link";
import { toBrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { BillingListSkeleton } from "./loading";
import { BillingFilters } from "./_/filters";

import { format } from "date-fns";

export default async function BillingPage({
  searchParams: _searchParams,
}: { searchParams: Promise<{ id?: string; status?: string; type?: string; date?: string; from?: string; to?: string; page?: string }> }) {
  const searchParams = await _searchParams;
  const statusFilter = searchParams.status || "all";
  const typeFilter = searchParams.type || "all";
  const dateFilter = searchParams.date || "all";
  const fromFilter = searchParams.from;
  const toFilter = searchParams.to;
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = 10;

  const { organizationId } = await getUser();

  if (!organizationId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <FileText size={64} className="text-muted-foreground/20 mb-6" />
        <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground max-w-md">
          Você precisa estar vinculado a uma organização para visualizar faturas.
        </p>
      </div>
    );
  }

  const allInvoices = await db.query.pgInvoice.findMany({
    where: eq(pgInvoice.orgId, organizationId),
    orderBy: [desc(pgInvoice.updatedAt)],
  });

  const plans = groupBy(await db.query.pgPlan.findMany(), "id");

  const processedInvoices = allInvoices.map((invoice) => {
    if (invoice.type === "domain") return invoice;
    const plan = plans[invoice.reference]?.[0];
    return {
      ...invoice,
      reference: plan ? plan.name : invoice.reference,
    };
  });

  // Apply filters
  const filteredInvoices = processedInvoices.filter((invoice) => {
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesType = typeFilter === "all" || invoice.type === typeFilter;
    
    let matchesDate = true;
    const invoiceDate = new Date(invoice.createdAt);
    const invoiceDayStr = format(invoiceDate, "yyyy-MM-dd");
    const now = new Date();
    
    if (dateFilter === "today") {
      matchesDate = invoiceDate.toDateString() === now.toDateString();
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      matchesDate = invoiceDate >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      matchesDate = invoiceDate >= monthAgo;
    } else if (dateFilter === "custom") {
      if (fromFilter && toFilter) {
        matchesDate = invoiceDayStr >= fromFilter && invoiceDayStr <= toFilter;
      } else if (fromFilter) {
        matchesDate = invoiceDayStr >= fromFilter;
      } else if (toFilter) {
        matchesDate = invoiceDayStr <= toFilter;
      }
    }

    return matchesStatus && matchesType && matchesDate;
  });

  // Calculate statistics
  const stats = {
    total: processedInvoices.length,
    pending: processedInvoices.filter(i => i.status === "pending").length,
    paid: processedInvoices.filter(i => i.status === "paid").length,
  };

  const totalFiltered = filteredInvoices.length;
  const totalPages = Math.ceil(totalFiltered / pageSize);
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Minhas Faturas</h1>
          <p className="text-muted-foreground">Gerencie seus pagamentos e histórico financeiro.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Faturas Pendentes</p>
            <h3 className="text-2xl font-bold mt-1 text-yellow-500">{stats.pending}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Faturas Pagas</p>
            <h3 className="text-2xl font-bold mt-1 text-green-500">{stats.paid}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total de Faturas</p>
            <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <BillingFilters 
          status={statusFilter} 
          type={typeFilter} 
          date={dateFilter} 
          from={fromFilter}
          to={toFilter}
        />

        <Suspense key={`${statusFilter}-${typeFilter}-${dateFilter}-${fromFilter}-${toFilter}-${currentPage}`} fallback={<BillingListSkeleton />}>
          {paginatedInvoices.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <FileText size={32} className="text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhuma fatura encontrada</h3>
                <p className="text-muted-foreground">Tente ajustar seus filtros.</p>
                <Button variant="link" asChild className="mt-4">
                  <Link href="/billing">Limpar filtros</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 mt-8">
              {paginatedInvoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice as any}
                  isExpanded={searchParams.id === invoice.id}
                />
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-8 border-t">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, totalFiltered)} de {totalFiltered}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild disabled={currentPage <= 1}>
                      <Link href={`/billing?status=${statusFilter}&type=${typeFilter}&date=${dateFilter}&page=${currentPage - 1}`} scroll={false}>
                        Anterior
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild disabled={currentPage >= totalPages}>
                      <Link href={`/billing?status=${statusFilter}&type=${typeFilter}&date=${dateFilter}&page=${currentPage + 1}`} scroll={false}>
                        Próximo
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Minhas Faturas - Atlas Hosting",
  description: "Visualize e gerencie suas faturas.",
};
