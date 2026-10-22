"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportAffiliateReport } from "@/lib/affiliate/export-report";
import type { AffiliateReportRow } from "./types";

export function AffiliateReportButton({ rows }: { rows: AffiliateReportRow[] }) {
  const [isExporting, setIsExporting] = useState(false);

  async function exportReport() {
    setIsExporting(true);
    try {
      await exportAffiliateReport(rows);
      toast.success("Relatório de afiliados exportado.");
    } catch {
      toast.error("Não foi possível exportar o relatório. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button
      className="cursor-pointer gap-2 disabled:cursor-not-allowed"
      disabled={rows.length === 0 || isExporting}
      onClick={exportReport}
      variant="outline"
    >
      <Download className="h-4 w-4" />
      {isExporting ? "Exportando..." : "Exportar PDF"}
    </Button>
  );
}
