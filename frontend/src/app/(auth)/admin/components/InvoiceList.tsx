import { and, desc, sql } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { pgInvoice, pgUser } from "@/lib/db/schema";

const ITEMS_PER_PAGE = 10;

interface InvoiceListProps {
  searchParams?: { page?: string; search?: string; clientId?: string };
  /** Cliente selecionado no dropdown de filtro, pra exibir o nome no cabeçalho da lista. */
  selectedClient?: { name: string; email: string } | null;
}

export async function InvoiceList({
  searchParams,
  selectedClient,
}: InvoiceListProps) {
  const page = Number(searchParams?.page) || 1;
  const search = searchParams?.search || "";
  const clientId = searchParams?.clientId || "";

  const conditions = [
    clientId ? sql`${pgInvoice.userId} = ${clientId}` : undefined,
    search
      ? sql`(${pgUser.name} ILIKE ${`%${search}%`} OR ${pgUser.email} ILIKE ${`%${search}%`})`
      : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);
  const whereClause = conditions.length ? and(...conditions) : undefined;

  const [invoices, totalInvoices] = await Promise.all([
    db
      .select({
        amount: pgInvoice.amount,
        createdAt: pgInvoice.createdAt,
        id: pgInvoice.id,
        status: pgInvoice.status,
        type: pgInvoice.type,
        user: {
          email: pgUser.email,
          name: pgUser.name,
        },
      })
      .from(pgInvoice)
      .leftJoin(pgUser, sql`${pgInvoice.userId} = ${pgUser.id}`)
      .where(whereClause)
      .orderBy(desc(pgInvoice.createdAt))
      .limit(ITEMS_PER_PAGE)
      .offset((page - 1) * ITEMS_PER_PAGE),
    db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(pgInvoice)
      .leftJoin(pgUser, sql`${pgInvoice.userId} = ${pgUser.id}`)
      .where(whereClause),
  ]);

  const totalPages = Math.ceil(totalInvoices[0].count / ITEMS_PER_PAGE);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline" | "action";
      }
    > = {
      failed: { label: "Falhou", variant: "destructive" },
      paid: { label: "Pago", variant: "action" },
      pending: { label: "Pendente", variant: "secondary" },
      refunded: { label: "Reembolsado", variant: "outline" },
    };
    const { label, variant } = statusMap[status] || {
      label: status,
      variant: "outline",
    };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      domain: "Domínio",
      plan: "Plano",
    };
    return typeMap[type] || type;
  };

  const pageQuery = (p: number) =>
    `?page=${p}${search ? `&search=${search}` : ""}${clientId ? `&clientId=${clientId}` : ""}`;

  return (
    <div className="space-y-4">
      {selectedClient && (
        <p className="text-muted-foreground text-sm">
          Mostrando faturas de{" "}
          <span className="font-medium text-foreground">
            {selectedClient.name}
          </span>{" "}
          ({selectedClient.email})
        </p>
      )}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 && (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={5}
                >
                  Nenhuma fatura encontrada.
                </TableCell>
              </TableRow>
            )}
            {invoices.map(invoice => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {invoice.user?.name || "N/A"}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {invoice.user?.email || "N/A"}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getTypeText(invoice.type)}</TableCell>
                <TableCell>R$ {invoice.amount.toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(invoice.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                href={pageQuery(page - 1)}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              pageNum => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={pageQuery(pageNum)}
                    isActive={pageNum === page}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                aria-disabled={page >= totalPages}
                className={
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }
                href={pageQuery(page + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
