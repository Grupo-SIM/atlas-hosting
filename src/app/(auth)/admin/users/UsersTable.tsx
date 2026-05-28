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

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

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
              <TableCell className="text-right">
                <UserActionsCell id={u.id} suspendedAt={u.suspendedAt} isAdmin={u.isAdmin} />
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
