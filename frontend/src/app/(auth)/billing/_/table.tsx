"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { cn, toBrl } from "@/lib/utils";

interface Invoice {
  id: string;
  status: "paid" | "pending" | "overdue" | "failed" | "processing";
  type: "domain" | "subscription";
  amount: string | number;
  reference: string;
  createdAt: Date;
}

const statusLabel: Record<string, string> = {
  failed: "Falhou",
  overdue: "Vencida",
  paid: "Pago",
  pending: "Pendente",
  processing: "Processando",
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "pending":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "overdue":
    case "failed":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "processing":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function BillingTable({
  invoices,
  page,
  total,
  pageSize,
}: {
  invoices: Invoice[];
  page: number;
  total: number;
  pageSize: number;
}) {
  const router = useRouter();

  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", p.toString());
    router.push(`/billing?${params.toString()}`, { scroll: false });
  };

  const columns: DataTableColumn<Invoice>[] = [
    {
      className:
        "text-left font-black tracking-tight text-zinc-400 uppercase text-[10px]",
      header: "ID da Fatura",
      headerClassName: "text-left",
      key: "id",
      render: row => <span>#{row.id.slice(0, 8)}</span>,
    },
    {
      className: "text-left font-bold",
      header: "Referência",
      headerClassName: "text-left",
      key: "reference",
      render: row => (
        <div className="flex flex-col items-start">
          <span className="text-sm">{row.reference}</span>
          <span
            className={cn(
              "mt-1 rounded px-1.5 py-0.5 font-black text-[9px] uppercase",
              row.type === "domain"
                ? "bg-indigo-500/10 text-indigo-400"
                : "bg-cyan-500/10 text-cyan-400"
            )}
          >
            {row.type === "domain" ? "Domínio" : "Plano"}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: row => (
        <Badge
          className={cn(
            "border px-3 py-1 font-black shadow-none",
            getStatusStyles(row.status)
          )}
        >
          {statusLabel[row.status] || row.status}
        </Badge>
      ),
    },
    {
      className: "text-right font-black text-primary text-lg tracking-tighter",
      header: "Valor Total",
      headerClassName: "text-right",
      key: "amount",
      render: row => <span>{toBrl(Number(row.amount))}</span>,
    },
    {
      className: "text-right text-zinc-500 font-medium",
      header: "Data de Emissão",
      headerClassName: "text-right",
      key: "createdAt",
      render: row => (
        <span>
          {format(new Date(row.createdAt), "dd/MM/yyyy HH:mm", {
            locale: ptBR,
          })}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      minWidth="min-w-[900px]"
      onPageChange={handlePageChange}
      onRowClick={row =>
        router.push(`/billing?id=${row.id}`, { scroll: false })
      }
      page={page}
      pageSize={pageSize}
      rows={invoices}
      total={total}
    />
  );
}
