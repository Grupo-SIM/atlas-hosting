import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { groupBy } from "lodash";
import { FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { InvoiceClientFilter } from "@/app/(auth)/admin/components/InvoiceClientFilter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getRealUser, getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgInvoice, pgUser } from "@/lib/db/schema";
import { BillingFilters } from "./_/filters";
import InvoiceCard, { type InvoiceCustomer } from "./_/invoice";
import { BillingListSkeleton } from "./loading";

interface InvoiceUser {
  name: string | null;
  email: string | null;
  billingDocument: string | null;
  billingPhone: string | null;
  billingStreet: string | null;
  billingNumber: string | null;
  billingNeighborhood: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingZipCode: string | null;
}

const toInvoiceCustomer = (
  user: InvoiceUser | null | undefined
): InvoiceCustomer | null =>
  user
    ? {
        city: user.billingCity,
        document: user.billingDocument,
        email: user.email,
        name: user.name,
        neighborhood: user.billingNeighborhood,
        number: user.billingNumber,
        phone: user.billingPhone,
        state: user.billingState,
        street: user.billingStreet,
        zipCode: user.billingZipCode,
      }
    : null;

export default async function BillingPage({
  searchParams: _searchParams,
}: {
  searchParams: Promise<{
    id?: string;
    status?: string;
    type?: string;
    date?: string;
    from?: string;
    to?: string;
    page?: string;
    clientId?: string;
  }>;
}) {
  const searchParams = await _searchParams;
  const statusFilter = searchParams.status || "all";
  const typeFilter = searchParams.type || "all";
  const dateFilter = searchParams.date || "all";
  const fromFilter = searchParams.from;
  const toFilter = searchParams.to;
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = 10;

  const user = await getUser();
  const realUser = await getRealUser();
  // Admin de verdade (não impersonando) pode escolher ver faturas de outro cliente
  // direto por aqui, sem precisar entrar em "Acessar como cliente".
  const canFilterByClient = realUser.isAdmin && !user.impersonatedBy;

  let organizationId = user.organizationId;
  let viewingClient: { name: string; email: string } | null = null;

  if (canFilterByClient && searchParams.clientId) {
    const target = await db.query.pgUser.findFirst({
      columns: { email: true, name: true, organizationId: true },
      where: eq(pgUser.id, searchParams.clientId),
    });
    if (target?.organizationId) {
      organizationId = target.organizationId;
      viewingClient = { email: target.email, name: target.name };
    }
  }

  const clients = canFilterByClient
    ? await db
        .selectDistinct({
          email: pgUser.email,
          id: pgUser.id,
          name: pgUser.name,
        })
        .from(pgInvoice)
        .innerJoin(pgUser, eq(pgInvoice.userId, pgUser.id))
        .orderBy(pgUser.name)
    : [];

  if (!organizationId) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center px-4 text-center">
        <FileText className="mb-6 text-muted-foreground/20" size={64} />
        <h2 className="mb-2 font-bold text-2xl">Acesso Restrito</h2>
        <p className="max-w-md text-muted-foreground">
          Você precisa estar vinculado a uma organização para visualizar
          faturas.
        </p>
      </div>
    );
  }

  const allInvoices = await db.query.pgInvoice.findMany({
    orderBy: [desc(pgInvoice.updatedAt)],
    where: eq(pgInvoice.orgId, organizationId),
    with: {
      user: {
        columns: {
          billingCity: true,
          billingDocument: true,
          billingNeighborhood: true,
          billingNumber: true,
          billingPhone: true,
          billingState: true,
          billingStreet: true,
          billingZipCode: true,
          email: true,
          name: true,
        },
      },
    },
  });

  const plans = groupBy(await db.query.pgPlan.findMany(), "id");

  const processedInvoices = allInvoices.map(invoice => {
    if (invoice.type === "domain") return invoice;
    const plan = plans[invoice.reference]?.[0];
    return {
      ...invoice,
      reference: plan ? plan.name : invoice.reference,
    };
  });

  // Apply filters
  const filteredInvoices = processedInvoices.filter(invoice => {
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;
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
    paid: processedInvoices.filter(i => i.status === "paid").length,
    pending: processedInvoices.filter(i => i.status === "pending").length,
    total: processedInvoices.length,
  };

  const totalFiltered = filteredInvoices.length;
  const totalPages = Math.ceil(totalFiltered / pageSize);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-black text-3xl tracking-tight">
            {viewingClient
              ? `Faturas de ${viewingClient.name}`
              : "Minhas Faturas"}
          </h1>
          <p className="text-muted-foreground">
            {viewingClient
              ? viewingClient.email
              : "Gerencie seus pagamentos e histórico financeiro."}
          </p>
        </div>
        {canFilterByClient && <InvoiceClientFilter clients={clients} />}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="font-medium text-muted-foreground text-sm">
              Faturas Pendentes
            </p>
            <h3 className="mt-1 font-bold text-2xl text-yellow-500">
              {stats.pending}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="font-medium text-muted-foreground text-sm">
              Faturas Pagas
            </p>
            <h3 className="mt-1 font-bold text-2xl text-green-500">
              {stats.paid}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="font-medium text-muted-foreground text-sm">
              Total de Faturas
            </p>
            <h3 className="mt-1 font-bold text-2xl">{stats.total}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <BillingFilters
          date={dateFilter}
          from={fromFilter}
          status={statusFilter}
          to={toFilter}
          type={typeFilter}
        />

        <Suspense
          fallback={<BillingListSkeleton />}
          key={`${statusFilter}-${typeFilter}-${dateFilter}-${fromFilter}-${toFilter}-${currentPage}`}
        >
          {paginatedInvoices.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center pt-12 pb-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <FileText className="text-muted-foreground/50" size={32} />
                </div>
                <h3 className="mb-2 font-semibold text-xl">
                  Nenhuma fatura encontrada
                </h3>
                <p className="text-muted-foreground">
                  Tente ajustar seus filtros.
                </p>
                <Button asChild className="mt-4" variant="link">
                  <Link
                    href={
                      searchParams.clientId
                        ? `/billing?clientId=${searchParams.clientId}`
                        : "/billing"
                    }
                  >
                    Limpar filtros
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-8 space-y-6">
              {paginatedInvoices.map(invoice => (
                <InvoiceCard
                  customer={toInvoiceCustomer(invoice.user)}
                  invoice={invoice as any}
                  isExpanded={searchParams.id === invoice.id}
                  key={invoice.id}
                />
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-8">
                  <div className="text-muted-foreground text-sm">
                    Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
                    {Math.min(currentPage * pageSize, totalFiltered)} de{" "}
                    {totalFiltered}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      asChild
                      disabled={currentPage <= 1}
                      size="sm"
                      variant="outline"
                    >
                      <Link
                        href={`/billing?status=${statusFilter}&type=${typeFilter}&date=${dateFilter}&page=${currentPage - 1}${searchParams.clientId ? `&clientId=${searchParams.clientId}` : ""}`}
                        scroll={false}
                      >
                        Anterior
                      </Link>
                    </Button>
                    <Button
                      asChild
                      disabled={currentPage >= totalPages}
                      size="sm"
                      variant="outline"
                    >
                      <Link
                        href={`/billing?status=${statusFilter}&type=${typeFilter}&date=${dateFilter}&page=${currentPage + 1}${searchParams.clientId ? `&clientId=${searchParams.clientId}` : ""}`}
                        scroll={false}
                      >
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
  description: "Visualize e gerencie suas faturas.",
  title: "Minhas Faturas - Atlas Hosting",
};
