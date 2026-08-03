"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileDown } from "lucide-react";
import { useMemo, useState } from "react";
import {
  DatePickerFilter,
  type DateRangeValue,
} from "@/components/DatePickerFilter";
import { HeaderTip } from "@/components/HeaderTip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { UserRow } from "./actions";
import { getUserClientStatus } from "./status";
import { UserActionsCell } from "./UserActionsCell";

function toBrl(value: number) {
  return value.toLocaleString("pt-BR", { currency: "BRL", style: "currency" });
}

const STATUS_LABEL = {
  active: "Ativo",
  inactive: "Inativo",
  suspended: "Suspenso",
} as const;

const STATUS_TIP =
  "Ativo: tem algo contratado conosco (VPS/VDS ou domínio). Inativo: tem conta mas não paga nada. Suspenso: conta bloqueada por um admin.";

export function UsersTable({ users }: { users: UserRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "suspended"
  >("all");
  const [dateFilter, setDateFilter] = useState<DateRangeValue>(null);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        search === "" ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || getUserClientStatus(u) === statusFilter;

      const createdDay = format(u.createdAt, "yyyy-MM-dd");
      const matchesDate =
        !dateFilter ||
        (createdDay >= dateFilter.from && createdDay <= dateFilter.to);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [users, search, statusFilter, dateFilter]);

  const periodLabel = dateFilter
    ? dateFilter.from === dateFilter.to
      ? format(new Date(`${dateFilter.from}T12:00:00`), "dd/MM/yyyy", {
          locale: ptBR,
        })
      : `${format(new Date(`${dateFilter.from}T12:00:00`), "dd/MM/yyyy", { locale: ptBR })} a ${format(new Date(`${dateFilter.to}T12:00:00`), "dd/MM/yyyy", { locale: ptBR })}`
    : null;

  const handleExportPdf = () => {
    exportTableToPdf({
      columns: [
        "Usuário",
        "Email",
        "Total Ganho",
        "Saldo Disponível",
        "Criado em",
        "Status",
        "Cobrança",
      ],
      filename: `usuarios${dateFilter ? `-${dateFilter.from}_a_${dateFilter.to}` : ""}.pdf`,
      rows: filtered.map(u => [
        u.name,
        u.email,
        toBrl(u.totalEarnedBrl),
        toBrl(u.balanceCents / 100),
        format(u.createdAt, "dd/MM/yyyy", { locale: ptBR }),
        STATUS_LABEL[getUserClientStatus(u)],
        u.subscriptionPaymentMethod === null
          ? "—"
          : u.subscriptionPaymentMethod === "credit_card"
            ? "Automático"
            : `Manual (${u.subscriptionPaymentMethod === "pix" ? "PIX" : "Boleto"})`,
      ]),
      subtitle: periodLabel
        ? `Filtrado por data de criação: ${periodLabel}`
        : `Todos os usuários — gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
      title: "Usuários — Atlas Hosting",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-sm"
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou email..."
          value={search}
        />
        <Select
          onValueChange={v => setStatusFilter(v as typeof statusFilter)}
          value={statusFilter}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
            <SelectItem value="suspended">Suspensos</SelectItem>
          </SelectContent>
        </Select>
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

      <div className="overflow-x-auto rounded-md border">
        <TooltipProvider delayDuration={150}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>
                  <HeaderTip
                    label="Total Ganho"
                    tip="Comissões de afiliado que esse usuário já ganhou indicando outros clientes. Não tem relação com o que ele comprou."
                  />
                </TableHead>
                <TableHead>
                  <HeaderTip
                    label="Saldo Disponível"
                    tip="Saldo atual da carteira de afiliado, disponível pra saque."
                  />
                </TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>
                  <HeaderTip label="Status" tip={STATUS_TIP} />
                </TableHead>
                <TableHead>
                  <HeaderTip
                    label="Cobrança"
                    tip="Forma de cobrança da assinatura VPS/VDS: Automático (cartão) ou Manual (PIX/Boleto). “—” significa que o usuário não tem assinatura."
                  />
                </TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{u.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {u.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {toBrl(u.totalEarnedBrl)}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {toBrl(u.balanceCents / 100)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(u.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const status = getUserClientStatus(u);
                      if (status === "suspended")
                        return <Badge variant="destructive">Suspenso</Badge>;
                      if (status === "active")
                        return <Badge variant="default">Ativo</Badge>;
                      return (
                        <Badge
                          className="border-slate-500/30 text-slate-500"
                          variant="outline"
                        >
                          Inativo
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {u.subscriptionPaymentMethod === null ? (
                      <span className="text-muted-foreground text-xs">—</span>
                    ) : u.subscriptionPaymentMethod === "credit_card" ? (
                      <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">
                        Automático
                      </Badge>
                    ) : (
                      <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-600 hover:bg-amber-500/15">
                        Manual (
                        {u.subscriptionPaymentMethod === "pix"
                          ? "PIX"
                          : "Boleto"}
                        )
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActionsCell
                      id={u.id}
                      isAdmin={u.isAdmin}
                      suspendedAt={u.suspendedAt}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-muted-foreground"
                    colSpan={7}
                  >
                    Nenhum usuário encontrado.
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
