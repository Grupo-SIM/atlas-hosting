import { db } from "@/lib/db";
import { invoiceTable, userTable } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 10;

interface InvoiceListProps {
  searchParams?: { page?: string; search?: string };
}

export async function InvoiceList({ searchParams }: InvoiceListProps) {
  const page = Number(searchParams?.page) || 1;
  const search = searchParams?.search || "";

  const [invoices, totalInvoices] = await Promise.all([
    db.select({
      id: invoiceTable.id,
      amount: invoiceTable.amount,
      status: invoiceTable.status,
      type: invoiceTable.type,
      createdAt: invoiceTable.createdAt,
      user: {
        name: userTable.name,
        email: userTable.email,
      },
    })
    .from(invoiceTable)
    .leftJoin(userTable, sql`${invoiceTable.userId} = ${userTable.id}`)
    .where(
      search
        ? sql`${userTable.name} ILIKE ${`%${search}%`} OR ${userTable.email} ILIKE ${`%${search}%`}`
        : undefined
    )
    .orderBy(desc(invoiceTable.createdAt))
    .limit(ITEMS_PER_PAGE)
    .offset((page - 1) * ITEMS_PER_PAGE),
    db.select({
      count: sql<number>`count(*)`
    })
    .from(invoiceTable)
    .leftJoin(userTable, sql`${invoiceTable.userId} = ${userTable.id}`)
    .where(
      search
        ? sql`${userTable.name} ILIKE ${`%${search}%`} OR ${userTable.email} ILIKE ${`%${search}%`}`
        : undefined
    )
  ]);

  const totalPages = Math.ceil(totalInvoices[0].count / ITEMS_PER_PAGE);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "action" }> = {
      paid: { label: "Pago", variant: "action" },
      pending: { label: "Pendente", variant: "secondary" },
      failed: { label: "Falhou", variant: "destructive" },
      refunded: { label: "Reembolsado", variant: "outline" },
    };
    const { label, variant } = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      domain: "Domínio",
      plan: "Plano",
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
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
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{invoice.user?.name || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">{invoice.user?.email || "N/A"}</div>
                  </div>
                </TableCell>
                <TableCell>{getTypeText(invoice.type)}</TableCell>
                <TableCell>R$ {invoice.amount.toFixed(2)}</TableCell>
                <TableCell>{new Date(invoice.createdAt).toLocaleDateString("pt-BR")}</TableCell>
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
                href={`?page=${page - 1}${search ? `&search=${search}` : ""}`}
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href={`?page=${pageNum}${search ? `&search=${search}` : ""}`}
                  isActive={pageNum === page}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href={`?page=${page + 1}${search ? `&search=${search}` : ""}`}
                aria-disabled={page >= totalPages}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
} 