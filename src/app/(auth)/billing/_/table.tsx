"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { toBrl } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Invoice = {
  id: string;
  status: "paid" | "pending" | "overdue" | "failed" | "processing";
  type: "domain" | "subscription";
  amount: string | number;
  reference: string;
  createdAt: Date;
};

const statusLabel: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Vencida",
  failed: "Falhou",
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
  pageSize 
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
      key: "id",
      header: "ID da Fatura",
      className: "text-left font-black tracking-tight text-zinc-400 uppercase text-[10px]",
      headerClassName: "text-left",
      render: (row) => <span>#{row.id.slice(0, 8)}</span>,
    },
    {
      key: "reference",
      header: "Referência",
      className: "text-left font-bold",
      headerClassName: "text-left",
      render: (row) => (
        <div className="flex flex-col items-start">
          <span className="text-sm">{row.reference}</span>
          <span className={cn(
            "text-[9px] uppercase font-black px-1.5 py-0.5 rounded mt-1",
            row.type === "domain" ? "bg-indigo-500/10 text-indigo-400" : "bg-cyan-500/10 text-cyan-400"
          )}>
            {row.type === "domain" ? "Domínio" : "Plano"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge className={cn("font-black px-3 py-1 border shadow-none", getStatusStyles(row.status))}>
          {statusLabel[row.status] || row.status}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Valor Total",
      className: "text-right font-black text-primary text-lg tracking-tighter",
      headerClassName: "text-right",
      render: (row) => <span>{toBrl(Number(row.amount))}</span>,
    },
    {
      key: "createdAt",
      header: "Data de Emissão",
      className: "text-right text-zinc-500 font-medium",
      headerClassName: "text-right",
      render: (row) => <span>{format(new Date(row.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={invoices}
      page={page}
      total={total}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      onRowClick={(row) => router.push(`/billing?id=${row.id}`, { scroll: false })}
      minWidth="min-w-[900px]"
    />
  );
}
