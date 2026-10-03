"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportTableToPdf } from "@/lib/exportPdf";
import type { AffiliateReportRow } from "./types";

const toBrl = (value: number) =>
  value.toLocaleString("pt-BR", { currency: "BRL", style: "currency" });

export function AffiliateReportButton({ rows }: { rows: AffiliateReportRow[] }) {
  function exportReport() {
    try {
      const now = new Date();
      exportTableToPdf({
        columns: ["Afiliado", "E-mail", "Código", "Indicações", "Vendas", "Valor das vendas", "Comissões", "Saldo disponível", "Saques pendentes"],
        filename: `relatorio-afiliados-${now.toISOString().slice(0, 10)}.pdf`,
        rows: rows.map(row => [
          row.name, row.email, row.affiliateCode ?? "---", row.referralCount,
          row.salesCount, toBrl(row.salesTotal), toBrl(row.commissionTotal),
          toBrl(row.balance), toBrl(row.pending),
        ]),
        subtitle: `Histórico completo · Gerado em ${now.toLocaleString("pt-BR")} · Comissões canceladas excluídas`,
        title: "Relatório de Afiliados",
      });
      toast.success("Relatório de afiliados exportado.");
    } catch {
      toast.error("Não foi possível exportar o relatório. Tente novamente.");
    }
  }

  return (
    <Button className="cursor-pointer gap-2 disabled:cursor-not-allowed" disabled={rows.length === 0} onClick={exportReport} variant="outline">
      <Download className="h-4 w-4" />
      Exportar PDF
    </Button>
  );
}
