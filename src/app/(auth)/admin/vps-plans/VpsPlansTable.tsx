"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Barcode, Clock, CreditCard, FileDown, QrCode } from "lucide-react";
import { useMemo, useState } from "react";
import {
  DatePickerFilter,
  type DateRangeValue,
} from "@/components/DatePickerFilter";
import { HeaderTip } from "@/components/HeaderTip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { exportTableToPdf } from "@/lib/exportPdf";
import { toBrl } from "@/lib/utils";
import type { VpsPlanRow } from "./actions";
import { SubscriptionActionsCell } from "./SubscriptionActionsCell";

const PLAN_TYPE_LABEL: Record<string, string> = {
  "storage-vps": "Storage",
  vds: "VDS",
  vps: "VPS",
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

function PaymentBadge({
  method,
}: {
  method: "credit_card" | "pix" | "boleto" | "voucher";
}) {
  if (method === "voucher") return <Badge variant="outline">Voucher integral</Badge>;
  if (method === "pix") {
    return (
      <Badge
        className="gap-1 border-emerald-500/30 text-emerald-600"
        variant="outline"
      >
        <QrCode className="h-3 w-3" />
        PIX
      </Badge>
    );
  }
  if (method === "boleto") {
    return (
      <Badge
        className="gap-1 border-amber-500/30 text-amber-600"
        variant="outline"
      >
        <Barcode className="h-3 w-3" />
        Boleto
      </Badge>
    );
  }
  return (
    <Badge className="gap-1" variant="outline">
      <CreditCard className="h-3 w-3" />
      Cartão
    </Badge>
  );
}

/** Cartão cobra sozinho no vencimento (automático); PIX/boleto exigem o cliente pagar de novo manualmente. */
function ChargeModeBadge({
  method,
}: {
  method: "credit_card" | "pix" | "boleto" | "voucher";
}) {
  if (method === "credit_card") {
    return (
      <Badge className="gap-1 border-sky-500/30 bg-sky-500/15 text-sky-600 hover:bg-sky-500/15">
        Automático
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 border-amber-500/30 bg-amber-500/15 text-amber-600 hover:bg-amber-500/15">
      Manual
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">
        Ativa
      </Badge>
    );
  }
  if (status === "cancelled") {
    return (
      <Badge className="gap-1 border-rose-500/30 bg-rose-500/15 text-rose-600 hover:bg-rose-500/15">
        Cancelada
      </Badge>
    );
  }
  const map: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    failed: { label: "Falhou", variant: "destructive" },
    paused: { label: "Pausada", variant: "secondary" },
  };
  const { label, variant } = map[status] ?? {
    label: status,
    variant: "outline",
  };
  return <Badge variant={variant}>{label}</Badge>;
}

const STATUS_LABEL: Record<string, string> = {
  active: "Ativa",
  cancelled: "Cancelada",
  failed: "Falhou",
  paused: "Pausada",
};

export function VpsPlansTable({ plans }: { plans: VpsPlanRow[] }) {
  const [dateFilter, setDateFilter] = useState<DateRangeValue>(null);

  const filtered = useMemo(() => {
    if (!dateFilter) return plans;
    return plans.filter(p => {
      const day = format(p.createdAt, "yyyy-MM-dd");
      return day >= dateFilter.from && day <= dateFilter.to;
    });
  }, [plans, dateFilter]);

  const dateRangeLabel = dateFilter
    ? dateFilter.from === dateFilter.to
      ? format(new Date(`${dateFilter.from}T12:00:00`), "dd/MM/yyyy", {
          locale: ptBR,
        })
      : `${format(new Date(`${dateFilter.from}T12:00:00`), "dd/MM/yyyy", { locale: ptBR })} a ${format(new Date(`${dateFilter.to}T12:00:00`), "dd/MM/yyyy", { locale: ptBR })}`
    : null;

  const handleExportPdf = () => {
    exportTableToPdf({
      columns: [
        "Cliente",
        "Email",
        "Tipo",
        "Período",
        "Pagamento",
        "Cobrança",
        "Próx. cobrança",
        "Valor",
        "Status",
      ],
      filename: `assinaturas-vps${dateFilter ? `-${dateFilter.from}_a_${dateFilter.to}` : ""}.pdf`,
      rows: filtered.map(plan => [
        plan.userName ?? "—",
        plan.userEmail,
        PLAN_TYPE_LABEL[plan.planType] ?? plan.planType,
        periodLabel(plan.intervalMonths),
        plan.paymentMethod === "pix"
          ? "PIX"
          : plan.paymentMethod === "boleto"
            ? "Boleto"
            : plan.paymentMethod === "voucher" ? "Voucher integral" : "Cartão",
        plan.paymentMethod === "credit_card" ? "Automático" : "Manual",
        format(plan.nextChargeDate, "dd/MM/yyyy", { locale: ptBR }),
        toBrl(plan.amountBrl),
        STATUS_LABEL[plan.status] ?? plan.status,
      ]),
      subtitle: dateRangeLabel
        ? `Filtrado por data de criação: ${dateRangeLabel}`
        : `Todas as assinaturas — gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
      title: "Assinaturas VPS — Atlas Hosting",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <DatePickerFilter
          onChange={setDateFilter}
          placeholder="Período de criação"
          value={dateFilter}
        />
        <Button
          className="ml-auto gap-2"
          onClick={handleExportPdf}
          variant="outline"
        >
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
                  <HeaderTip
                    label="Tipo"
                    tip="Tipo de servidor contratado: VPS, VDS, Windows ou Storage."
                  />
                </TableHead>
                <TableHead>
                  <HeaderTip
                    label="Período"
                    tip="Duração do ciclo de cobrança da assinatura (1, 6, 12... meses)."
                  />
                </TableHead>
                <TableHead>
                  <HeaderTip
                    label="Pagamento"
                    tip="Método usado pelo cliente pra pagar: Cartão, PIX ou Boleto."
                  />
                </TableHead>
                <TableHead>
                  <HeaderTip
                    label="Cobrança"
                    tip="Automático: cartão cobra sozinho no vencimento. Manual: PIX/Boleto exigem o cliente pagar de novo."
                  />
                </TableHead>
                <TableHead>
                  <HeaderTip
                    label="Próx. cobrança"
                    tip="Data em que a assinatura vence e precisa ser renovada/cobrada de novo."
                  />
                </TableHead>
                <TableHead>
                  <HeaderTip
                    label="Valor"
                    tip="Valor cobrado por ciclo de cobrança, em reais."
                  />
                </TableHead>
                <TableHead>
                  <HeaderTip
                    label="Status"
                    tip="Situação da assinatura: Ativa, Pausada, Cancelada ou Falhou (não confundir com status da conta do usuário)."
                  />
                </TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(plan => {
                const isExpiring =
                  plan.status === "active" &&
                  plan.nextChargeDate.getTime() <= Date.now() + FIFTEEN_DAYS_MS;
                const remainingDays = daysUntil(plan.nextChargeDate);
                return (
                  <TableRow
                    className={
                      isExpiring
                        ? "bg-amber-500/10 hover:bg-amber-500/15"
                        : undefined
                    }
                    key={plan.id}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {plan.userName ?? "—"}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {plan.userEmail}
                        </span>
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
                        <span>
                          {format(plan.nextChargeDate, "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                        {isExpiring && (
                          <Badge
                            className="w-fit gap-1 border-amber-500/40 text-amber-600"
                            variant="outline"
                          >
                            <Clock className="h-3 w-3" />
                            {remainingDays <= 0
                              ? "Vencida"
                              : `Vence em ${remainingDays} ${remainingDays === 1 ? "dia" : "dias"}`}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {toBrl(plan.amountBrl)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={plan.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <SubscriptionActionsCell
                        id={plan.id}
                        nextChargeDate={plan.nextChargeDate}
                        paymentMethod={plan.paymentMethod}
                        status={plan.status}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-muted-foreground"
                    colSpan={9}
                  >
                    {plans.length === 0
                      ? "Nenhuma assinatura registrada."
                      : "Nenhuma assinatura nessa data."}
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
