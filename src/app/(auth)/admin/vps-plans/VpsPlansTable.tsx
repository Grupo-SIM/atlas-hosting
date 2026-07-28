"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HeaderTip } from "@/components/HeaderTip";
import { DatePickerFilter, type DateRangeValue } from "@/components/DatePickerFilter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toBrl } from "@/lib/utils";
import { exportTableToPdf } from "@/lib/exportPdf";
import { Clock, CreditCard, QrCode, Barcode, FileDown } from "lucide-react";
import { SubscriptionActionsCell } from "./SubscriptionActionsCell";
import type { VpsPlanRow } from "./actions";

const PLAN_TYPE_LABEL: Record<string, string> = {
  vps: "VPS",
  vds: "VDS",
  "storage-vps": "Storage",
  "vps-windows": "Windows",
};

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

function periodLabel(months: number) {
  if (months === 1) return "1 mês";
  return `${months} meses`;
}

function daysUntil(date: Date) {
  return Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

function PaymentBadge({ method }: { method: "credit_card" | "pix" | "boleto" }) {
  if (method === "pix") {
    return (
      <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-500/30">
        <QrCode className="h-3 w-3" />
        PIX
      </Badge>
    );
  }
  if (method === "boleto") {
    return (
      <Badge variant="outline" className="gap-1 text-amber-600 border-amber-500/30">
        <Barcode className="h-3 w-3" />
        Boleto
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <CreditCard className="h-3 w-3" />
      Cartão
    </Badge>
  );
}

/** Cartão cobra sozinho no vencimento (automático); PIX/boleto exigem o cliente pagar de novo manualmente. */
function ChargeModeBadge({ method }: { method: "credit_card" | "pix" | "boleto" }) {
  if (method === "credit_card") {
    return (
      <Badge className="gap-1 bg-sky-500/15 text-sky-600 border-sky-500/30 hover:bg-sky-500/15">
        Automático
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/15">
      Manual
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/15">
        Ativa
      </Badge>
    );
  }
  if (status === "cancelled") {
    return (
      <Badge className="gap-1 bg-rose-500/15 text-rose-600 border-rose-500/30 hover:bg-rose-500/15">
        Cancelada
      </Badge>
    );
  }
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    paused: { label: "Pausada", variant: "secondary" },
    failed: { label: "Falhou", variant: "destructive" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "outline" };
  return <Badge variant={variant}>{label}</Badge>;
}

const STATUS_LABEL: Record<string, string> = {
  active: "Ativa",
  paused: "Pausada",
  cancelled: "Cancelada",
  failed: "Falhou",
};

export function VpsPlansTable({ plans }: { plans: VpsPlanRow[] }) {
  const [dateFilter, setDateFilter] = useState<DateRangeValue>(null);

  const filtered = useMemo(() => {
    if (!dateFilter) return plans;
    return plans.filter((p) => {
      const day = format(p.createdAt, "yyyy-MM-dd");
      return day >= dateFilter.from && day <= dateFilter.to;
    });
  }, [plans, dateFilter]);

  const dateRangeLabel = dateFilter
    ? dateFilter.from === dateFilter.to
      ? format(new Date(`${dateFilter.from}T12:00:00`), "dd/MM/yyyy", { locale: ptBR })
      : `${format(new Date(`${dateFilter.from}T12:00:00`), "dd/MM/yyyy", { locale: ptBR })} a ${format(new Date(`${dateFilter.to}T12:00:00`), "dd/MM/yyyy", { locale: ptBR })}`
    : null;

  const handleExportPdf = () => {
    exportTableToPdf({
      title: "Assinaturas VPS — Atlas Hosting",
      subtitle: dateRangeLabel
        ? `Filtrado por data de criação: ${dateRangeLabel}`
        : `Todas as assinaturas — gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
      columns: ["Cliente", "Email", "Tipo", "Período", "Pagamento", "Cobrança", "Próx. cobrança", "Valor", "Status"],
      rows: filtered.map((plan) => [
        plan.userName ?? "—",
        plan.userEmail,
        PLAN_TYPE_LABEL[plan.planType] ?? plan.planType,
        periodLabel(plan.intervalMonths),
        plan.paymentMethod === "pix" ? "PIX" : plan.paymentMethod === "boleto" ? "Boleto" : "Cartão",
        plan.paymentMethod === "credit_card" ? "Automático" : "Manual",
        format(plan.nextChargeDate, "dd/MM/yyyy", { locale: ptBR }),
        toBrl(plan.amountBrl),
        STATUS_LABEL[plan.status] ?? plan.status,
      ]),
      filename: `assinaturas-vps${dateFilter ? `-${dateFilter.from}_a_${dateFilter.to}` : ""}.pdf`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <DatePickerFilter value={dateFilter} onChange={setDateFilter} placeholder="Período de criação" />
        <Button variant="outline" onClick={handleExportPdf} className="ml-auto gap-2">
          <FileDown className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <div className="overflow-x-auto">
        <TooltipProvider delayDuration={150}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>
                  <HeaderTip label="Tipo" tip="Tipo de servidor contratado: VPS, VDS, Windows ou Storage." />
                </TableHead>
                <TableHead>
                  <HeaderTip label="Período" tip="Duração do ciclo de cobrança da assinatura (1, 6, 12... meses)." />
                </TableHead>
                <TableHead>
                  <HeaderTip label="Pagamento" tip="Método usado pelo cliente pra pagar: Cartão, PIX ou Boleto." />
                </TableHead>
                <TableHead>
                  <HeaderTip label="Cobrança" tip="Automático: cartão cobra sozinho no vencimento. Manual: PIX/Boleto exigem o cliente pagar de novo." />
                </TableHead>
                <TableHead>
                  <HeaderTip label="Próx. cobrança" tip="Data em que a assinatura vence e precisa ser renovada/cobrada de novo." />
                </TableHead>
                <TableHead>
                  <HeaderTip label="Valor" tip="Valor cobrado por ciclo de cobrança, em reais." />
                </TableHead>
                <TableHead>
                  <HeaderTip label="Status" tip="Situação da assinatura: Ativa, Pausada, Cancelada ou Falhou (não confundir com status da conta do usuário)." />
                </TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((plan) => {
                const isExpiring =
                  plan.status === "active" &&
                  plan.nextChargeDate.getTime() <= Date.now() + FIFTEEN_DAYS_MS;
                const remainingDays = daysUntil(plan.nextChargeDate);
                return (
                  <TableRow key={plan.id} className={isExpiring ? "bg-amber-500/10 hover:bg-amber-500/15" : undefined}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{plan.userName ?? "—"}</span>
                        <span className="text-xs text-muted-foreground">{plan.userEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {PLAN_TYPE_LABEL[plan.planType] ?? plan.planType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {periodLabel(plan.intervalMonths)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <PaymentBadge method={plan.paymentMethod} />
                    </TableCell>
                    <TableCell>
                      <ChargeModeBadge method={plan.paymentMethod} />
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-col gap-1">
                        <span>{format(plan.nextChargeDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                        {isExpiring && (
                          <Badge variant="outline" className="w-fit gap-1 text-amber-600 border-amber-500/40">
                            <Clock className="h-3 w-3" />
                            {remainingDays <= 0 ? "Vencida" : `Vence em ${remainingDays} ${remainingDays === 1 ? "dia" : "dias"}`}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {toBrl(plan.amountBrl)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={plan.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <SubscriptionActionsCell
                        id={plan.id}
                        status={plan.status}
                        paymentMethod={plan.paymentMethod}
                        nextChargeDate={plan.nextChargeDate}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    {plans.length === 0 ? "Nenhuma assinatura registrada." : "Nenhuma assinatura nessa data."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>
    </div>
  );
}
