"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HeaderTip } from "@/components/HeaderTip";
import { DatePickerFilter, type DateRangeValue } from "@/components/DatePickerFilter";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { exportTableToPdf } from "@/lib/exportPdf";
import { UserActionsCell } from "./UserActionsCell";
import type { UserRow } from "./actions";

function toBrl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<"all" | "subscriber" | "none">("all");
  const [dateFilter, setDateFilter] = useState<DateRangeValue>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        search === "" ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && u.suspendedAt === null) ||
        (statusFilter === "suspended" && u.suspendedAt !== null);

      const matchesSubscription =
        subscriptionFilter === "all" ||
        (subscriptionFilter === "subscriber" && u.hasActiveSubscription) ||
        (subscriptionFilter === "none" && !u.hasActiveSubscription);

      const createdDay = format(u.createdAt, "yyyy-MM-dd");
      const matchesDate =
        !dateFilter || (createdDay >= dateFilter.from && createdDay <= dateFilter.to);

      return matchesSearch && matchesStatus && matchesSubscription && matchesDate;
    });
  }, [users, search, statusFilter, subscriptionFilter, dateFilter]);

  const periodLabel = dateFilter
    ? dateFilter.from === dateFilter.to
      ? format(new Date(`${dateFilter.from}T12:00:00`), "dd/MM/yyyy", { locale: ptBR })
      : `${format(new Date(`${dateFilter.from}T12:00:00`), "dd/MM/yyyy", { locale: ptBR })} a ${format(new Date(`${dateFilter.to}T12:00:00`), "dd/MM/yyyy", { locale: ptBR })}`
    : null;

  const handleExportPdf = () => {
    exportTableToPdf({
      title: "Usuários — Atlas Hosting",
      subtitle: periodLabel
        ? `Filtrado por data de criação: ${periodLabel}`
        : `Todos os usuários — gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
      columns: ["Usuário", "Email", "Total Ganho", "Saldo Disponível", "Criado em", "Status", "Assinatura", "Cobrança"],
      rows: filtered.map((u) => [
        u.name,
        u.email,
        toBrl(u.totalEarnedBrl),
        toBrl(u.balanceCents / 100),
        format(u.createdAt, "dd/MM/yyyy", { locale: ptBR }),
        u.suspendedAt === null ? "Ativo" : "Suspenso",
        u.hasActiveSubscription ? "Cliente" : "Sem assinatura",
        u.subscriptionPaymentMethod === null
          ? "—"
          : u.subscriptionPaymentMethod === "credit_card"
            ? "Automático"
            : `Manual (${u.subscriptionPaymentMethod === "pix" ? "PIX" : "Boleto"})`,
      ]),
      filename: `usuarios${dateFilter ? `-${dateFilter.from}_a_${dateFilter.to}` : ""}.pdf`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="suspended">Suspensos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={subscriptionFilter} onValueChange={(v) => setSubscriptionFilter(v as any)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Assinatura" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos (assinatura)</SelectItem>
            <SelectItem value="subscriber">Com assinatura</SelectItem>
            <SelectItem value="none">Sem assinatura</SelectItem>
          </SelectContent>
        </Select>
        <DatePickerFilter value={dateFilter} onChange={setDateFilter} placeholder="Período de criação" />
        <Button variant="outline" onClick={handleExportPdf} className="ml-auto gap-2">
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
              <HeaderTip
                label="Status"
                tip="Se a conta (login) está ativa ou foi suspensa por um admin. Não indica se ele é cliente."
              />
            </TableHead>
            <TableHead>
              <HeaderTip
                label="Assinatura"
                tip="Se o usuário tem assinatura VPS/VDS ativa ou pausada — ou seja, se é cliente pagante."
              />
            </TableHead>
            <TableHead>
              <HeaderTip
                label="Cobrança"
                tip="Forma de cobrança da assinatura: Automático (cartão) ou Manual (PIX/Boleto)."
              />
            </TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold">{u.name}</span>
                  <span className="text-xs text-muted-foreground">{u.email}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm font-medium">
                {toBrl(u.totalEarnedBrl)}
              </TableCell>
              <TableCell className="text-sm font-medium">
                {toBrl(u.balanceCents / 100)}
              </TableCell>
              <TableCell className="text-sm">
                {format(u.createdAt, "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell>
                {u.suspendedAt === null ? (
                  <Badge variant="default">Ativo</Badge>
                ) : (
                  <Badge variant="destructive">Suspenso</Badge>
                )}
              </TableCell>
              <TableCell>
                {u.hasActiveSubscription ? (
                  <Badge className="bg-sky-500/15 text-sky-600 border-sky-500/30 hover:bg-sky-500/15">
                    Cliente
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-500 border-slate-500/30">
                    Sem assinatura
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {u.subscriptionPaymentMethod === null ? (
                  <span className="text-xs text-muted-foreground">—</span>
                ) : u.subscriptionPaymentMethod === "credit_card" ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/15">
                    Automático
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/15">
                    Manual ({u.subscriptionPaymentMethod === "pix" ? "PIX" : "Boleto"})
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <UserActionsCell id={u.id} suspendedAt={u.suspendedAt} isAdmin={u.isAdmin} />
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
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
