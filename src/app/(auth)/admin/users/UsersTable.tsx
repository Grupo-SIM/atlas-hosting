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
import { UserActionsCell } from "./UserActionsCell";
import type { UserRow } from "./actions";

function toBrl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<"all" | "subscriber" | "none">("all");

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

      return matchesSearch && matchesStatus && matchesSubscription;
    });
  }, [users, search, statusFilter, subscriptionFilter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
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
      </div>

      <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Total Ganho</TableHead>
            <TableHead>Saldo Disponível</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assinatura</TableHead>
            <TableHead>Cobrança</TableHead>
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
                  <Badge variant="outline" className="text-amber-600 border-amber-500/30">
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
      </div>
    </div>
  );
}
